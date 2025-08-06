import { Company, MenuCategory, MenuItem, OrderType } from '../types/types';
import { db } from './index';

export async function queueOrder(order: OrderType): Promise<void> {
  await db.posOrderQueue.add(order);
}

export async function getQueuedOrders(): Promise<OrderType[]> {
  return await db.posOrderQueue.toArray();
}

export async function removeQueuedOrder(id: number): Promise<void> {
  await db.posOrderQueue.delete(id);
}
export async function saveOrderToQueue(order: OrderType): Promise<void> {
  await db.posOrderQueue.add(order);
}

export async function clearOrderQueue(): Promise<void> {
  await db.posOrderQueue.clear();
}
export async function clearMenuitems(): Promise<void> {
  await db.menuItems.clear();
}
export async function getMenuItemsFromIndexedDB(): Promise<MenuItem[]> {
  return await db.menuItems.toArray();
}

export async function saveMenuItemsToIndexedDB(
  menuItems: MenuItem[],
): Promise<void> {
  await db.menuItems.bulkPut(menuItems);
}

export async function getMenuCategoriesFromIndexedDB(): Promise<
  MenuCategory[]
  > {
  return await db.menuCategories.toArray();
}

export async function saveMenuCategoryToIndexedDB(
  menuCategories: MenuCategory[],
): Promise<void> {
  await db.menuCategories.bulkPut(menuCategories);
}

export async function getCompanyFromIndexedDB(
  key: string,
): Promise<Company | undefined> {
  return await db.company.get(key);
}

export async function saveCompanyToIndexedDB(company: Company): Promise<void> {
  await db.company.put(company, company.id);
}

export async function clearCompanyFromIndexedDB(): Promise<void> {
  await db.company.clear();
}

export async function clearAllIndexedDB(): Promise<void> {
  await clearCompanyFromIndexedDB();
  await clearMenuitems();
  await clearOrderQueue();
  await db.delete();
  console.log('All IndexedDB cleared');
}
