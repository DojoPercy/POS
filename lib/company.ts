
export async function getCompany(companyId: string) {
    let url: string;

    if (typeof window !== "undefined") {
     
      url = `/api/company`;
    } else {
      
      url = new URL("/api/company", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").toString();
    }
    
    
      const res = await fetch(`${url}?companyId=${companyId}`, { cache: "no-store" });
      return res.json();
    
    
}