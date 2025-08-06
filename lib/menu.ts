import { PrismaClient } from '@prisma/client';
import { MenuItem } from './types/types';
import { clearMenuitems } from './dexie/actions';

export enum menuOperations {
  createMenu,
  getMenu,
  getMenuById,
  updateMenu,
  deleteMenu,
}

export async function createMenuItem(data: Omit<MenuItem, 'id'>) {
  const query = {
    queryType: menuOperations.createMenu,
    data,
  };
  const response = await fetch('/api/menu', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query),
    cache: 'no-store',
  }).then(res => res.json());
  await clearMenuitems();
  return response;
}

export async function getMenuItems(companyId: String) {
  const query = {
    queryType: menuOperations.getMenu,
  };

  const response = await fetch(`/api/menu?companyId=${companyId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  }).then(res => res.json());
  console.log(response);
  return response;
}

export async function getMenuItemById(id: string) {
  const query = {
    queryType: menuOperations.getMenuById,
    id,
  };
  const response = await fetch(`/api/menu?id=${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  }).then(res => res.json());

  return response;
}

export async function updateMenuItem(data: MenuItem) {
  try {
    const query = {
      queryType: menuOperations.updateMenu,
      data,
    };
    const response = await fetch('/api/menu', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    }).then(res => res.json());

    return response;
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw new Error('Failed to update menu item');
  }
}

export async function deleteMenuItem(id: string) {
  const query = {
    queryType: menuOperations.deleteMenu,
    id,
  };
  const response = await fetch('/api/menu', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query),
    cache: 'no-store',
  }).then(res => res.json());

  return response;
}

export async function getMenuCategories(companyId: string) {
  const response = await fetch(`/api/menu/category?companyId=${companyId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  }).then(res => res.json());
  return response;
}

export async function createMenuCategory(data: {
  name: string;
  companyId: string;
  description?: string;
}) {
  const response = await fetch('/api/menu/category', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  }).then(res => res.json());

  return response;
}
