import { get } from "http";

export async function getBranchById(id: string) {
    try {
      const response = await fetch(`/api/branches?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch branch with id ${id}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("getBranchById error:", error);
      return null;
    }
  }
  
  export async function getBranchNameById(id: string): Promise<string | null> {
    try {
      const res = await getBranchById(id);
      if (res && Array.isArray(res) && res.length > 0) {
        return res[0].name;
      } else if (res && res.name) {
        return res.name; // in case your API returns a single object instead of an array
      }
      return null;
    } catch (error) {
      console.error("getBranchNameById error:", error);
      return null;
    }
  }
  

export async function getBranches(companyId: String){
    try{
        const response = await fetch(`/api/branches?companyId=${companyId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        }).then((res) => res.json());
    
        return response;
    }catch{
        

    }
}

