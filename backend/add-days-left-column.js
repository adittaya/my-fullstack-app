const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// If we don't have credentials from .env, try to get them from environment variables
// This is useful when running in environments like Render where env vars are set directly
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url' || supabaseAnonKey === 'your_supabase_api_key') {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

async function addDaysLeftColumn() {
  try {
    console.log('Adding days_left column to investments table...');
    
    // Add days_left column to investments table
    const { error: addColumnError } = await supabase.rpc('execute_sql', {
      sql: `
        ALTER TABLE investments 
        ADD COLUMN IF NOT EXISTS days_left INTEGER;
      `
    });
    
    if (addColumnError) {
      console.error('Error adding days_left column:', addColumnError);
      return;
    } else {
      console.log('days_left column added successfully');
    }
    
    // Update existing investments to set days_left based on plan duration
    console.log('Updating existing investments with days_left values...');
    
    // First, get all product plans with their duration_days
    const { data: plans, error: plansError } = await supabase
      .from('product_plans')
      .select('id, duration_days');
    
    if (plansError) {
      console.error('Error fetching product plans:', plansError);
      return;
    }
    
    // Create a map of plan_id to duration_days
    const planDurationMap = {};
    plans.forEach(plan => {
      planDurationMap[plan.id] = plan.duration_days;
    });
    
    // Get all investments that don't have days_left set
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('id, plan_id')
      .is('days_left', null);
    
    if (investmentsError) {
      console.error('Error fetching investments:', investmentsError);
      return;
    }
    
    // Update each investment with the appropriate days_left value
    for (const investment of investments) {
      const durationDays = planDurationMap[investment.plan_id] || 30; // Default to 30 if not found
      
      const { error: updateError } = await supabase
        .from('investments')
        .update({ days_left: durationDays })
        .eq('id', investment.id);
      
      if (updateError) {
        console.error(`Error updating investment ${investment.id}:`, updateError);
      } else {
        console.log(`Updated investment ${investment.id} with days_left: ${durationDays}`);
      }
    }
    
    console.log('All investments updated with days_left values');
    console.log('Database update completed!');
  } catch (error) {
    console.error('Database update error:', error);
  }
}

addDaysLeftColumn();