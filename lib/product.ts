export async function getProducts() {
    const res = await fetch(`api/products`, {
    }).then((res) => res.json());
    return res;
}