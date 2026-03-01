/**
 * A-CLEAN PLATFORM - SUPABASE CONNECTION CODE
 * 
 * This file connects your forms to your database.
 * 
 * HOW TO USE:
 * 1. Create a file called "supabase-config.js"
 * 2. Copy this entire code into it
 * 3. Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_KEY with your real values
 * 4. Add this file to your GitHub repository
 * 5. Include it in your HTML files (instructions below)
 */

// ============================================================================
// STEP 1: CONFIGURE YOUR SUPABASE CREDENTIALS
// ============================================================================

// Replace these with YOUR actual values from supabase-credentials.txt
const SUPABASE_URL = https://oqnxliojnmzgtzyytukz.supabase.co
const SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbnhsaW9qbm16Z3R6eXl0dWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNDMwODYsImV4cCI6MjA4NzgxOTA4Nn0.eO51G3lr657VYRyKttwTyBC87YaG1TLsrKJ_ZNxoxyM

// Create connection to Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// PROVIDER REGISTRATION FORM
// ============================================================================

async function submitProviderRegistration(formData) {
  try {
    console.log('Submitting provider registration...');
    
    // Generate application ID
    const applicationId = 'ACP-' + Date.now().toString().slice(-8);
    
    // First, create user account
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email: formData.email,
          user_type: 'provider',
          full_name: formData.fullName,
          phone: formData.phone
        }
      ])
      .select()
      .single();
    
    if (userError) {
      console.error('Error creating user:', userError);
      throw userError;
    }
    
    console.log('User created:', userData);
    
    // Then, create provider profile
    const { data: providerData, error: providerError } = await supabase
      .from('providers')
      .insert([
        {
          user_id: userData.id,
          business_name: formData.businessName || null,
          provider_type: formData.providerType,
          contact_email: formData.email,
          contact_phone: formData.phone,
          whatsapp_phone: formData.whatsapp || null,
          business_address: formData.businessAddress,
          team_size: parseInt(formData.teamSize) || 1,
          dbs_staff_count: parseInt(formData.dbsStaff) || 0,
          max_simultaneous_jobs: formData.maxSimultaneousJobs || null,
          services: formData.services, // Already an array
          boroughs: formData.boroughs, // Already an array
          availability: formData.availability,
          response_time: formData.responseTime,
          days_available: formData.daysAvailable, // Already an array
          emergency_jobs: formData.emergencyJobs || false,
          dbs_number: formData.dbsNumber,
          dbs_issue_date: formData.dbsIssueDate,
          dbs_update_service: formData.dbsUpdateService || false,
          public_liability_insurance: formData.publicLiability || false,
          employers_liability_insurance: formData.employersLiability || false,
          years_experience: formData.yearsExperience,
          company_number: formData.companyNumber || null,
          vat_number: formData.vatNumber || null,
          website: formData.website || null,
          about_text: formData.aboutYou || null,
          account_status: 'pending',
          verification_status: 'pending'
        }
      ])
      .select()
      .single();
    
    if (providerError) {
      console.error('Error creating provider:', providerError);
      throw providerError;
    }
    
    console.log('Provider created:', providerData);
    
    // Save references
    if (formData.references && formData.references.length > 0) {
      const { error: refError } = await supabase
        .from('provider_references')
        .insert(
          formData.references.map(ref => ({
            provider_id: providerData.id,
            reference_name: ref.name,
            relationship: ref.relationship,
            phone: ref.phone,
            email: ref.email || null
          }))
        );
      
      if (refError) {
        console.error('Error saving references:', refError);
      }
    }
    
    console.log('✅ Registration successful!');
    return { success: true, applicationId: applicationId };
    
  } catch (error) {
    console.error('❌ Registration failed:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// SOCIAL WORKER QUOTE FORM
// ============================================================================

async function submitQuoteRequest(formData) {
  try {
    console.log('Submitting quote request...');
    
    // Generate reference number
    const referenceNumber = 'ACL-SW-' + Date.now().toString().slice(-8);
    
    // Calculate quote deadline based on urgency
    const deadline = new Date();
    if (formData.urgency === 'emergency') {
      deadline.setHours(deadline.getHours() + 24); // 24 hours
    } else if (formData.urgency === 'urgent') {
      deadline.setDate(deadline.getDate() + 3); // 3 days
    } else {
      deadline.setDate(deadline.getDate() + 7); // 1 week
    }
    
    // Insert quote request
    const { data, error } = await supabase
      .from('quote_requests')
      .insert([
        {
          id: referenceNumber,
          sw_name: formData.swName,
          sw_email: formData.swEmail,
          sw_phone: formData.swPhone,
          sw_organisation: formData.swOrganisation,
          sw_department: formData.swDepartment || null,
          case_reference: formData.caseReference || null,
          client_name: formData.clientName || null,
          client_contact: formData.clientContact || null,
          client_address: formData.propertyAddress,
          property_type: formData.propertyType,
          bedrooms: parseInt(formData.bedrooms) || null,
          services: formData.services, // Already an array
          urgency: formData.urgency,
          preferred_date: formData.preferredDate || null,
          quote_deadline: deadline.toISOString(),
          borough: formData.borough,
          property_condition: formData.propertyCondition || null,
          special_requirements: formData.specialRequirements || null,
          access_arrangements: formData.accessArrangements || null,
          dbs_required: formData.dbsRequired || false,
          safeguarding_case: formData.safeguardingCase || false,
          vulnerable_adult: formData.vulnerableAdult || false,
          budget_range: formData.budgetRange || null,
          funding_source: formData.fundingSource || null,
          status: 'open',
          estimated_job_size: estimateJobSize(formData)
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating quote request:', error);
      throw error;
    }
    
    console.log('✅ Quote request created:', data);
    return { success: true, referenceNumber: referenceNumber };
    
  } catch (error) {
    console.error('❌ Quote request failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to estimate job size
function estimateJobSize(formData) {
  const bedrooms = parseInt(formData.bedrooms) || 1;
  const serviceCount = formData.services.length;
  
  if (bedrooms >= 4 || serviceCount >= 5) return 'extra-large';
  if (bedrooms >= 3 || serviceCount >= 4) return 'large';
  if (bedrooms >= 2 || serviceCount >= 2) return 'medium';
  return 'small';
}

// ============================================================================
// PROVIDER QUOTE SUBMISSION
// ============================================================================

async function submitQuote(quoteData) {
  try {
    console.log('Submitting quote...');
    
    const { data, error } = await supabase
      .from('quotes')
      .insert([
        {
          quote_request_id: quoteData.jobId,
          provider_id: quoteData.providerId, // You'll get this from login later
          price: parseFloat(quoteData.price),
          duration: quoteData.duration,
          start_date: quoteData.startDate,
          team_size: quoteData.teamSize || null,
          quote_breakdown: quoteData.details,
          special_considerations: quoteData.considerations || null,
          questions_for_sw: quoteData.questions || null,
          status: 'submitted'
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error submitting quote:', error);
      throw error;
    }
    
    console.log('✅ Quote submitted:', data);
    return { success: true, quoteId: data.id };
    
  } catch (error) {
    console.error('❌ Quote submission failed:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// FETCH FUNCTIONS (to display data)
// ============================================================================

// Get all pending provider applications (for admin dashboard)
async function getPendingProviders() {
  const { data, error } = await supabase
    .from('providers')
    .select(`
      *,
      users (
        email,
        full_name,
        phone
      )
    `)
    .eq('account_status', 'pending')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching providers:', error);
    return [];
  }
  
  return data;
}

// Get all open quote requests
async function getOpenQuoteRequests() {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching quote requests:', error);
    return [];
  }
  
  return data;
}

// Get jobs matched to a specific provider
async function getProviderJobs(providerId) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      quote_requests (*)
    `)
    .eq('provider_id', providerId)
    .eq('notified', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching provider jobs:', error);
    return [];
  }
  
  return data;
}

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

// Approve a provider
async function approveProvider(providerId) {
  const { data, error } = await supabase
    .from('providers')
    .update({
      account_status: 'active',
      verification_status: 'verified'
    })
    .eq('id', providerId)
    .select()
    .single();
  
  if (error) {
    console.error('Error approving provider:', error);
    return { success: false };
  }
  
  console.log('✅ Provider approved:', data);
  return { success: true, data };
}

// Reject a provider
async function rejectProvider(providerId, reason) {
  const { data, error } = await supabase
    .from('providers')
    .update({
      account_status: 'rejected',
      verification_status: 'rejected'
    })
    .eq('id', providerId)
    .select()
    .single();
  
  if (error) {
    console.error('Error rejecting provider:', error);
    return { success: false };
  }
  
  // Save admin note with rejection reason
  await supabase
    .from('admin_notes')
    .insert([{
      related_to_type: 'provider',
      related_to_id: providerId,
      note_text: `Rejected: ${reason}`,
      note_type: 'verification'
    }]);
  
  console.log('✅ Provider rejected');
  return { success: true };
}

// ============================================================================
// EXPORT FUNCTIONS (so other files can use them)
// ============================================================================

window.ACleanAPI = {
  submitProviderRegistration,
  submitQuoteRequest,
  submitQuote,
  getPendingProviders,
  getOpenQuoteRequests,
  getProviderJobs,
  approveProvider,
  rejectProvider
};

console.log('✅ A-Clean API initialized and ready!');
