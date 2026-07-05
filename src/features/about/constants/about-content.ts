/**
 * Static content for the About ProScan screen.
 */

export const APP_VERSION = '9.5.7';

export type AboutMenuItem = {
  id: string;
  label: string;
  url: string;
};

export const ABOUT_MENU_ITEMS: AboutMenuItem[] = [
  { id: 'job-vacancy', label: 'Job Vacancy', url: 'https://proscan.app/careers' },
  { id: 'developer', label: 'Developer', url: 'https://proscan.app/developer' },
  { id: 'partner', label: 'Partner', url: 'https://proscan.app/partner' },
  { id: 'accessibility', label: 'Accessibility', url: 'https://proscan.app/accessibility' },
  { id: 'privacy-policy', label: 'Privacy Policy', url: 'https://proscan.app/privacy' },
  { id: 'feedback', label: 'Feedback', url: 'mailto:support@proscan.app' },
  { id: 'rate-us', label: 'Rate us', url: 'https://proscan.app/rate' },
  { id: 'website', label: 'Visit Our Website', url: 'https://proscan.app' },
  { id: 'social', label: 'Follow us on Social Media', url: 'https://proscan.app/social' },
];
