import axios from "axios";
import { Category } from './types/types';

export async function completeBusiness(formData: any) {
  try {
   
    if (formData.userId) {
      // 2. Create the Company
      const companyData = {
        name: formData.businessName,
        location: formData.businessAddress,
        city: formData.city || "",
        state: formData.state || "",
        country: formData.country || "",
        currency: formData.currency,
        taxRate: formData.taxRate,
        enableDiscount: formData.enableDiscounts,
        isActivated: false,
        paymentMethods: formData.paymentMethods,
        orderProcessingMode: formData.orderProcessingMode,
        logo: formData.businessLogo,
        ownerId: formData.userId,
        subscriptionPlan: formData.subscriptionPlan || "monthly",
        subscriptionStatus: "active",
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1-year
        branches: [],
        users: [],
        menus: [],
        Order: [],
        Expense: [],
      };

      const companyResponse = await axios.post("/api/company", companyData);

      if (companyResponse.status === 201) {
        const companyId = companyResponse.data.id;

        // 3. Create Branch Managers & Branches
        const branchResponses = await Promise.all(
          formData.branches.map(async (branch: any) => {
            try {
              // 3.1 Generate random password
              const randomPassword = Math.random().toString(36).slice(-8);

              // 3.2 Create Manager Account
              const managerData = {
                email: branch.manager.email,
                fullname: branch.manager.name,
                password: randomPassword,
                role: "manager",
                phone: "",
                branchId: null,
                status: "pending",
              };

              const managerResponse = await axios.post("/api/users", managerData);

              if (managerResponse.status === 201) {
                const managerId = managerResponse.data.user.id;

                // 3.3 Create the Branch
                const branchData = {
                  name: branch.name,
                  location: branch.location,
                  city: branch.city,
                  state: branch.state,
                  country: branch.country,
                  openingHours: branch.openingHours,
                  status: branch.status || "active",
                  managerId: managerId,
                  createdBy: formData.userId,
                  companyId: companyId,
                };

                const branchResponse = await axios.post("/api/branches", branchData);

                if (branchResponse.status === 201) {
                  const branchId = branchResponse.data.id;

                  // 3.4 Update Manager Account with branchId
                  await axios.put(`/api/users/${managerId}`, { branchId, companyId });

                  // 3.5 Send email to manager with login credentials
                  await axios.post("/api/send-mail", {
                    to: branch.manager.email,
                    subject: "Your Manager Account has been created",
                    body: `
                      Hello ${branch.manager.name},
                      Your account as a branch manager has been created. Please log in using:
                      
                      Email: ${branch.manager.email}
                      Temporary Password: ${randomPassword}

                      Please reset your password upon login.
                    `,
                  });

                  console.log(`Branch "${randomPassword}" and Manager account created successfully.`);
                }
              }
            } catch (error) {
              console.error(`Error creating branch and manager for ${branch.name}:`, error);
            }
          })
        );

        console.log("All branches and managers processed:", branchResponses);

        // 4. Create Menu Categories and Menu Items
        
        if(true){
          formData.menuCategories.map(async (category: any) => {

            const menuCategoriesResponse = await axios.post("/api/menu/category", {
              name: category.name,
              description: category.description,
              companyId: companyId,
            })

            if ( menuCategoriesResponse.status === 201){
              const CategoryId = menuCategoriesResponse.data.id;
              category.menuItems.map(async (item: any) => {
                const formattedPrices = item.priceTypes.map((p:any) => ({
                  name: p.name,
                  price: Number.parseFloat(p.price),
                }))
          
                const response = await fetch("/api/menu", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: item.name,
                    description: item.description,
                    prices: formattedPrices,
                    categoryId: CategoryId,
                    imageBase64: item.imageBase64,
                    companyId,
                  }),
                })
          
                if (response.status === 201){
                  console.log("Menu Items created successfully");
                }else{
                  console.error("Error creating menu items: ", response)
                }
              })
            }

          })
        }
      }
      }
    
              
    
  } catch (error) {
    console.error("Error in completeBusiness:", error);
  }
}
