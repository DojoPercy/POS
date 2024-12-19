import { PrismaClient } from '@prisma/client';

;

export enum menuOperations {
    createMenu,
    getMenu,
    getMenuById,
    updateMenu,
    deleteMenu,
}

export type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageBase64: string;
};

export async function createMenuItem(data: Omit<MenuItem, 'id'>) {
    const query = {
        queryType: menuOperations.createMenu,
        data,
    };
    const response = await fetch(`/api/menu`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store',
    }).then((res) => res.json());

    return response;
}

export async function getMenuItems() {
    const query = {
        queryType: menuOperations.getMenu,
    };
    const response = await fetch(`/api/menu`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    }).then((res) => res.json());

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
    }).then((res) => res.json());

    return response;
}

export async function updateMenuItem(data: MenuItem) {
    const query = {
        queryType: menuOperations.updateMenu,
        data,
    };
    const response = await fetch(`/api/menu`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store',
    }).then((res) => res.json());

    return response;
}

export async function deleteMenuItem(id: string) {
    const query = {
        queryType: menuOperations.deleteMenu,
        id,
    };
    const response = await fetch(`/api/menu`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store',
    }).then((res) => res.json());

    return response;
}
