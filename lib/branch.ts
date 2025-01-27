export async function getBranchById(id: string){
    try{
        const response = await fetch(`/api/branches?id=${id}`, {
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