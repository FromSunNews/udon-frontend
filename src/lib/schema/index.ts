import { SITE_URL } from '@/utils/env';

/**
 * Organization schema for website
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Udon Finance',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      // Add your social media links here
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+84-123-456-789',
      contactType: 'customer service',
      email: 'contact@yourdomain.com',
      availableLanguage: ['English'],
    },
  };
}

/**
 * Website schema
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Udon Frontend',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Breadcrumb schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
