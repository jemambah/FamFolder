import FarmData from '../models/FarmData.js';

// Reference data for validation
const REFERENCE_DATA = {
  yieldRanges: {
    maize: { min: 0.5, max: 12 }, // tons per hectare
    beans: { min: 0.3, max: 3 },
    coffee: { min: 0.5, max: 3 },
    tomatoes: { min: 5, max: 100 },
    potatoes: { min: 5, max: 60 }
  },
  priceRanges: {
    maize: { min: 0.2, max: 1.5 }, // USD per kg
    beans: { min: 0.5, max: 3 },
    coffee: { min: 1, max: 8 },
    tomatoes: { min: 0.3, max: 4 }
  }
};

export const dataValidation = async (data) => {
  const issues = [];
  let healthScore = 100;

  // Validate yield data
  if (data.category === 'harvest' && data.quantity && data.crop) {
    const cropRange = REFERENCE_DATA.yieldRanges[data.crop];
    if (cropRange) {
      if (data.quantity < cropRange.min) {
        issues.push(`Yield seems low for ${data.crop}. Typical range: ${cropRange.min}-${cropRange.max} tons/hectare`);
        healthScore -= 15;
      } else if (data.quantity > cropRange.max) {
        issues.push(`Yield seems unusually high for ${data.crop}. Typical range: ${cropRange.min}-${cropRange.max} tons/hectare`);
        healthScore -= 25;
      }
    }
  }

  // Validate price data
  if (data.category === 'market' && data.revenue && data.quantity && data.crop) {
    const pricePerUnit = data.revenue / data.quantity;
    const priceRange = REFERENCE_DATA.priceRanges[data.crop];
    if (priceRange) {
      if (pricePerUnit < priceRange.min * 0.5) {
        issues.push(`Sale price seems very low for ${data.crop}. Typical range: $${priceRange.min}-$${priceRange.max}/kg`);
        healthScore -= 20;
      } else if (pricePerUnit > priceRange.max * 2) {
        issues.push(`Sale price seems unusually high for ${data.crop}. Typical range: $${priceRange.min}-$${priceRange.max}/kg`);
        healthScore -= 15;
      }
    }
  }

  // Validate cost data
  if (data.cost && data.cost < 0) {
    issues.push('Cost cannot be negative');
    healthScore -= 30;
  }

  // Validate date
  if (data.date && new Date(data.date) > new Date()) {
    issues.push('Future dates are not allowed');
    healthScore -= 25;
  }

  // Check for missing critical fields
  const criticalFields = ['category', 'date'];
  criticalFields.forEach(field => {
    if (!data[field]) {
      issues.push(`Missing required field: ${field}`);
      healthScore -= 10;
    }
  });

  return {
    ...data,
    dataHealth: {
      score: Math.max(healthScore, 0),
      issues,
      lastChecked: new Date()
    },
    isVerified: issues.length === 0
  };
};

export const calculateYieldAnalysis = (farmData) => {
  const yieldData = farmData.filter(item => item.category === 'harvest');
  
  if (yieldData.length === 0) {
    return { totalYield: 0, averageYield: 0, yieldCount: 0 };
  }
  
  const totalYield = yieldData.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const averageYield = totalYield / yieldData.length;
  
  // Group by crop
  const yieldByCrop = yieldData.reduce((acc, item) => {
    const crop = item.crop || 'unknown';
    if (!acc[crop]) acc[crop] = { total: 0, count: 0 };
    acc[crop].total += item.quantity || 0;
    acc[crop].count += 1;
    return acc;
  }, {});
  
  return {
    totalYield,
    averageYield: Math.round(averageYield * 100) / 100,
    yieldCount: yieldData.length,
    byCrop: yieldByCrop
  };
};

export const calculateFinancials = (farmData) => {
  const revenueData = farmData.filter(item => item.category === 'market');
  const costData = farmData.filter(item => 
    ['input', 'labor', 'equipment'].includes(item.category)
  );
  
  const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalCost = costData.reduce((sum, item) => sum + (item.cost || 0), 0);
  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    profitMargin: Math.round(profitMargin * 100) / 100
  };
};
