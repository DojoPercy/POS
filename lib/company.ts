import { Company } from './types/types';

export async function getCompany(companyId: string) {
  let url: string;

  if (typeof window !== 'undefined') {
    url = '/api/company';
  } else {
    url = new URL(
      '/api/company',
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    ).toString();
  }

  console.log(url);
  const res = await fetch(`${url}?companyId=${companyId}`, {
    cache: 'no-store',
  });
  return res.json();
}

export async function updateCompanyDetails(
  companyId: string,
  updatedCompany: Company,
) {
  console.log(companyId, updatedCompany)
  let url: string;
  if (typeof window !== 'undefined') {
    url = '/api/company';
  } else {
    url = new URL(
      '/api/company',
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    ).toString();
  }
}
