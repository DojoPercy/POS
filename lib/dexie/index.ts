import Dexie, { Table } from 'dexie';
import { MenuItem, MenuCategory, OrderType, Company } from '../types/types';

class MenuDB extends Dexie {
  menuItems!: Table<MenuItem, string>;
  menuCategories!: Table<MenuCategory, string>;
  company!: Table<Company, string>;
  posOrderQueue!: Table<OrderType, number>;

  constructor() {
    super('menuDB');
    this.version(2).stores({
      menuItems: 'id',
      menuCategories: 'id',
      company: '',
      posOrderQueue: '++id, orderNumber, requiredDate',
    });
  }
}

export const db = new MenuDB();
