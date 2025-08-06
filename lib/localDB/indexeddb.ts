// import { MenuItem, MenuCategory } from "../types/types";

// const dbName = "menuDB";
// const menuItemsStoreName = "menuItems";
// const menuCategoriesStoreName = "menuCategories";
// const companyStoreName = "company";

// function openDb(): Promise<IDBDatabase> {
//     return new Promise((resolve, reject) => {
//         // Open the database with version 2 to trigger onupgradeneeded for schema updates
//         const request = indexedDB.open(dbName, 3);

//         request.onerror = (event) => reject(event);
//         request.onsuccess = (event) => resolve((event.target as IDBRequest).result);

//         request.onupgradeneeded = (event) => {
//             const db = (event.target as IDBRequest).result;

//             if (!db.objectStoreNames.contains(menuItemsStoreName)) {
//                 db.createObjectStore(menuItemsStoreName, { keyPath: "id" });
//             }
//             if (!db.objectStoreNames.contains(companyStoreName)) {
//                 db.createObjectStore(companyStoreName, { keyPath: "id" });
//             }

//             if (!db.objectStoreNames.contains(menuCategoriesStoreName)) {
//                 db.createObjectStore(menuCategoriesStoreName, { keyPath: "id" });
//             }
//         };
//     });
// }

// export async function getMenuItemsFromIndexedDB(): Promise<MenuItem[]> {
//     const db = await openDb();
//     return new Promise((resolve, reject) => {
//         const transaction = db.transaction(menuItemsStoreName, "readonly");
//         const store = transaction.objectStore(menuItemsStoreName);
//         const request = store.getAll();

//         request.onsuccess = () => resolve(request.result as MenuItem[]);
//         request.onerror = (event) => reject(event);
//     });
// }

// export async function saveMenuItemsToIndexedDB(menuItems: MenuItem[]): Promise<void> {
//     const db = await openDb();
//     console.log("Saving MenuItems to IndexedDB:", menuItems);
//     return new Promise((resolve, reject) => {
//         const transaction = db.transaction(menuItemsStoreName, "readwrite");
//         const store = transaction.objectStore(menuItemsStoreName);

//         menuItems.forEach(item => store.put(item));
//         transaction.oncomplete = () => resolve();
//         transaction.onerror = (event) => reject(event);
//     });
// }

// export async function getMenuCategoriesFromIndexedDB(): Promise<MenuCategory[]> {
//     console.log("Fetching MenuCategories from IndexedDB");
//     const db = await openDb();
//     console.log("Opened IndexedDB:", db);
//     const returnvalue = new Promise((resolve, reject) => {
//         const transaction = db.transaction(menuCategoriesStoreName, "readonly");
//         const store = transaction.objectStore(menuCategoriesStoreName);
//         const request = store.getAll();
//         console.log("Request to get all MenuCategories:", request);
//         request.onsuccess = () => resolve(request.result as MenuCategory[]);
//         request.onerror = (event) => reject(event);
//     });
//     console.log("Returning MenuCategories:", returnvalue);
//     return returnvalue as Promise<MenuCategory[]>;
// }

// // Save MenuCategory to IndexedDB
// export async function saveMenuCategoryToIndexedDB(menuCategories: MenuCategory[]): Promise<void> {
//     const db = await openDb();
//     console.log("Saving MenuCategories to IndexedDB:", menuCategories);
//     return new Promise((resolve, reject) => {
//         const transaction = db.transaction(menuCategoriesStoreName, "readwrite");
//         const store = transaction.objectStore(menuCategoriesStoreName);

//         menuCategories.forEach((menuCategory) => {
//             store.put(menuCategory);
//         });

//         transaction.oncomplete = () => resolve();
//         transaction.onerror = (event) => reject(event);
//     });
// }

// export async function getCompanyFromIndexedDB(): Promise<any> {
//     const db = await openDb();
//     return new Promise((resolve, reject) => {
//         const transaction = db.transaction(companyStoreName, "readonly");
//         const store = transaction.objectStore(companyStoreName);
//         const request = store.getAll();

//         request.onsuccess = () => resolve(request.result as any);
//         request.onerror = (event) => reject(event);
//     });
// }

// export async function saveCompanyToIndexedDB(company: any[]): Promise<void> {
//     const db = await openDb();
//     return new Promise((resolve, reject) => {
//         const transaction = db.transaction(companyStoreName, "readwrite");
//         const store = transaction.objectStore(companyStoreName);

//         store.put(company);
//         transaction.oncomplete = () => resolve();
//         transaction.onerror = (event) => reject(event);
//     });
// }
