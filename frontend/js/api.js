/**
 * B&M Blueprint L.L.C. - Decoupled Data & API Service Layer
 * Serves static program curriculum, tutor credentials, pricing, testimonials,
 * and contact inquiry processing for B&M Blueprint SAT Tutoring.
 */

export const API_BASE_URL = window.ENV_API_BASE_URL || '';

const RECAPTCHA_SITE_KEY = '6LfdxYYtAAAAACdMZriZWK_JZJQGeWrOQs4FF9nh';

// Artificial latency helper to simulate real-world async network calls (ms)
const simulateLatency = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

let recaptchaResolve = null;
let recaptchaReject = null;
let recaptchaTimeout = null;

// Expose callbacks to the global window object so reCAPTCHA can find them
window.onRecaptchaSuccess = function(token) {
  grecaptcha.reset();
  if (recaptchaTimeout) clearTimeout(recaptchaTimeout);
  if (recaptchaResolve) {
    recaptchaResolve(token);
    recaptchaResolve = null;
    recaptchaReject = null;
  }
};

window.onRecaptchaError = function() {
  grecaptcha.reset();
  if (recaptchaTimeout) clearTimeout(recaptchaTimeout);
  if (recaptchaReject) {
    recaptchaReject(new Error('reCAPTCHA encountered a network error or verification timed out.'));
    recaptchaResolve = null;
    recaptchaReject = null;
  }
};

/**
 * Executes Invisible reCAPTCHA v2 and returns the token
 */
async function executeRecaptcha() {
  return new Promise((resolve, reject) => {
    if (typeof grecaptcha === 'undefined') {
      console.error("reCAPTCHA script not loaded. Security validation failed.");
      return reject(new Error('reCAPTCHA script failed to load. Please disable your adblocker or try again.'));
    }
    
    recaptchaResolve = resolve;
    recaptchaReject = reject;
    
    // 60-second timeout for user to complete the challenge (if presented)
    recaptchaTimeout = setTimeout(() => {
      grecaptcha.reset();
      if (recaptchaReject) recaptchaReject(new Error('Verification timed out. Please try again.'));
      recaptchaResolve = null;
      recaptchaReject = null;
    }, 60000);
    
    grecaptcha.ready(function() {
      try {
        grecaptcha.execute();
      } catch (err) {
        console.error("reCAPTCHA Execution Error:", err);
        clearTimeout(recaptchaTimeout);
        reject(new Error('Failed to execute reCAPTCHA.'));
      }
    });
  });
}

/**
 * Mock Data Repository for B&M Blueprint L.L.C.
 */
const DATA_REPOSITORY = {
  companyInfo: {
    name: 'B&M Blueprint L.L.C.',
    tagline1: 'Give yourself a real shot at bright futures',
    tagline2: 'Tired of generic prep?',
    email: 'bandmblueprint@gmail.com',
    phone: '850-556-9742, 850-966-0051',
    address: 'Tallahassee, Florida 32312',
    targetScore: 1330,
    scholarshipTarget: '100% Florida Bright Futures Scholarship (In-State Tuition)',
    mission: 'At B&M Blueprint, our mission is to deliver high-impact, results-driven SAT preparation. By pairing interactive group lectures with personalized 1-on-1 mentoring, our intensive 18-hour program equips students with the exact strategies needed to surpass target thresholds, unlock 100% Bright Futures scholarship coverage, and gain admission to top-tier universities nationwide.',
    copyright: '2026 B&M Blueprint L.L.C.'
  },

  program: {
    title: '4-Week, 18-Hour SAT Intensive Program',
    price: 799,
    totalHours: 18,
    groupHours: 14,
    privateHours: 4,
    durationWeeks: 4,
    sessionStructure: 'Each 2-hour group session is divided into two 1-hour blocks. Each hour consists of a concept lecture, followed by a practice problem set, followed by a detailed step-by-step solution review (~1 Hour each).',
    weeks: [
      {
        weekNumber: 1,
        title: 'Week 1: Core Reading and Foundations of Algebra',
        groupSessions: [
          { type: 'Reading & Writing — Group (2 Hours)', duration: '' },
          { type: 'Algebra and Advanced Algebra 1 — Group (2 Hours)', duration: '' }
        ],
        flexSession: 'FLEX Hour 1 — Private (1 Hour)',
        description: 'Reading session covers Reading & Writing strategies. Math session covers Algebra and Advanced Algebra 1.'
      },
      {
        weekNumber: 2,
        title: 'Week 2: Grammar Mastery and Advanced Math',
        groupSessions: [
          { type: 'Grammar 1 and 2 — Group (2 Hours)', duration: '' },
          { type: 'Advanced Algebra 2 and Geometry & Trigonometry — Group (2 Hours)', duration: '' }
        ],
        flexSession: 'FLEX Hour 2 — Private (1 Hour)',
        description: 'Reading Session Covers Grammar 1 and 2. Math Session Covers Advanced Algebra 2 and Geometry & Trigonometry.'
      },
      {
        weekNumber: 3,
        title: 'Week 3: Advanced Vocabulary and Data Analysis',
        groupSessions: [
          { type: 'Grammar 3 and Vocabulary — Group (2 Hours)', duration: '' },
          { type: 'Problem-Solving & Data Analysis — Group (2 Hours)', duration: '' }
        ],
        flexSession: 'FLEX Hour 3 — Private (1 Hour)',
        description: 'Reading Session Covers Grammar 3 and Vocabulary. Math session covers Problem-Solving & Data Analysis.'
      },
      {
        weekNumber: 4,
        title: 'Week 4: Comprehensive Review and Final Prep',
        groupSessions: [
          { type: 'Combined Math & Reading Final Review Session — Group (2 Hours)', duration: '' }
        ],
        flexSession: 'FLEX Hour 4 — Private (1 Hour)',
        description: 'Integrated 2-hour review going over key math formulas, reading passage strategies, and test-day pacing.'
      }
    ],
    privateSessions: {
      total: 4,
      durationPerSession: '1 Hour (1-on-1)',
      description: 'Four 1-hour private 1-on-1 tutoring sessions sprinkled throughout the 4-week program with either Jonah Blay or Kasey Mick for personalized diagnostic feedback.'
    }
  },

  coFounders: [
    {
      id: 'jonah-blay',
      name: 'Jonah Blay',
      role: 'Co-Founder and Lead Math Tutor',
      focusArea: 'Focuses on Math Tutoring\n(Leads all Group Math Sessions)',
      highSchoolScore: '800 SAT Math Section',
      university: 'University of Notre Dame (Junior)',
      majors: 'Physics, Honors Math, and Spanish',
      honors: 'Glynn Family Honors Program',
      avatarPlaceholder: 'JB',
      photoFile: 'photo_jonah.jpg',
      schoolLogoFile: 'nd.jpg',
      bio: 'Jonah scored an 800 on the SAT Math section in high school. Currently a junior majoring in Physics, Honors Math, and Spanish in Notre Dame’s Glynn Family Honors Program, Jonah leads all group math sessions and specialized 1-on-1 math problem solving.'
    },
    {
      id: 'kasey-mick',
      name: 'Kasey Mick',
      role: 'Co-Founder and Lead Reading Tutor',
      focusArea: 'Focuses on Reading Tutoring\n(Leads all Group Reading Sessions)',
      highSchoolScore: '790 SAT Reading & Writing Section',
      university: 'University of Florida (Junior)',
      majors: 'Industrial and Systems Engineering',
      honors: 'Honors Program',
      avatarPlaceholder: 'KM',
      photoFile: 'photo_kasey.jpg',
      schoolLogoFile: 'uf.png',
      bio: 'Kasey scored a 790 on the SAT Reading & Writing section in high school. Currently a junior majoring in Industrial and Systems Engineering in UF’s Honors Program, Kasey leads all group reading sessions and specialized 1-on-1 reading passage pacing.'
    }
  ],

  cohorts: [
    { name: 'August 2025 SAT Program', status: 'Completed' },
    { name: 'March 2026 SAT Program', status: 'Completed' },
    { name: 'August 2026 SAT Program', status: 'Currently Active' },
    { name: 'October 2026 SAT Program', status: 'Upcoming' },
    { name: 'December 2026 SAT Program', status: 'Upcoming' }
  ],

  testimonials: [
    {
      id: 'rev-1',
      studentName: 'Levi P.',
      scoreImprovement: 'First-Time Tester',
      rating: 5,
      reviewText: 'Working with Jonah and Kasey throughout the SAT prep program was a super thorough and helpful experience. Both guys paced each of our large group meetings very well, included a great variety of test content, and balanced proper time to address any questions or concerns that we had. I\'m super thankful for their work and would highly recommend the course to any student who wants to strengthen their current SAT skills or pick up the new ones that Jonah and Kasey have to offer.'
    },
    {
      id: 'rev-2',
      studentName: 'Tristan P.',
      scoreImprovement: '130 Point Increase',
      rating: 5,
      reviewText: 'I had a great experience working with both Kasey and Jonah. Their teaching styles made challenging concepts much clearer, and the strategies they shared truly helped improve both my SAT score and confidence. I\'d highly recommend their program to anyone preparing for the SAT.'
    },
    {
      id: 'rev-3',
      studentName: 'Katie N.',
      scoreImprovement: '100 Point Increase',
      rating: 5,
      reviewText: 'Working with Kasey and Jonah has been one of the most helpful experiences for my SAT prep. They both have more recent, first-hand experience and they were incredibly engaging and flexible with sessions. The extra support and practice they offered helped my score increase by 100 points after only four weeks of working with them. I truly felt more prepared and confident thanks to their personalized tutoring.'
    }
  ],

  parentTestimonials: [
    {
      id: 'prev-1',
      studentName: 'Amy N.',
      scoreImprovement: '',
      rating: 5,
      reviewText: 'This program has been fantastic for my daughter. Kasey and Jonah have provided her with testing strategies and knowledge to help her improve her score tremendously on the SAT. These two intelligent young men provide a fresh perspective, having recently taken the SAT themselves! They both scored very high! Sometimes I think having input from someone who has recently been through the testing experience themselves is more beneficial than a typical structured computer program or prep course. They do a fantastic job of balancing individual tutoring time with group instruction. Thanks so much!'
    }
  ]
};

/**
 * Service API Methods
 */
export const BlueprintAPI = {
  async getCompanyInfo() {
    await simulateLatency(100);
    return { success: true, data: DATA_REPOSITORY.companyInfo };
  },

  async getProgramDetails() {
    await simulateLatency(150);
    return { success: true, data: DATA_REPOSITORY.program };
  },

  async getCoFounders() {
    await simulateLatency(150);
    return { success: true, data: DATA_REPOSITORY.coFounders };
  },

  async getCohorts() {
    await simulateLatency(100);
    return { success: true, data: DATA_REPOSITORY.cohorts };
  },

  async getTestimonials() {
    await simulateLatency(150);
    return { success: true, data: DATA_REPOSITORY.testimonials };
  },

  async getParentTestimonials() {
    await simulateLatency(150);
    return { success: true, data: DATA_REPOSITORY.parentTestimonials };
  },

  async addTestimonial(newReview) {
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxh8kgVIvx-lPrGfcDTaQtQne51ho9vEp240G4FnsLrA6QBz2uJ7Qm5HjqYXmithZRXFA/exec';
    
    // 1. Fetch reCAPTCHA token before making the request
    const token = await executeRecaptcha();
    newReview['g-recaptcha-response'] = token;

    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify(newReview)
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to submit review');
    }
    
    return { success: true };
  },

  async calculateTutoringCost({ hours, subjectType }) {
    await simulateLatency(100);
    if (subjectType === 'sat-private') {
      const cost = hours * 75;
      return { success: true, data: { total: cost, rate: 75, currency: 'USD' } };
    }
    return { success: true, data: { customInquiryRequired: true } };
  },

  async submitInquiry(payload) {
    if (!payload.name || !payload.email || !payload.message) {
      throw new Error('Please provide your name, email, and inquiry message.');
    }

    // 1. Fetch reCAPTCHA token before making the request
    const token = await executeRecaptcha();

    // 2. Add properties for backend routing
    payload['g-recaptcha-response'] = token;
    payload.action = 'contact';

    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxh8kgVIvx-lPrGfcDTaQtQne51ho9vEp240G4FnsLrA6QBz2uJ7Qm5HjqYXmithZRXFA/exec';

    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to submit inquiry');
    }

    return {
      success: true,
      data: {
        message: 'Thank you for reaching out to B&M Blueprint L.L.C.! Your inquiry has been sent to Jonah and Kasey. We will respond within 24 hours.'
      }
    };
  }
};
