import axios from 'axios';
import type { MenuIngredient } from '@/lib/types/types';
import { uploadBase64Image } from './cloudnary';
import { id } from 'date-fns/locale';

export async function completeBusiness(formData: any) {
  try {
    if (formData.userId) {
      // 1. Create the Company
      const companyData = {
        name: formData.businessName,
        location: formData.businessAddress,
        city: formData.city || '',
        state: formData.state || '',
        country: formData.country || '',
        currency: formData.currency,
        taxRate: formData.taxRate,
        enableDiscount: formData.enableDiscounts,
        isActivated: false,
        paymentMethods: formData.paymentMethods,
        orderProcessingMode: formData.orderProcessingMode,
        logo: formData.businessLogo,
        ownerId: formData.userId,
        subscriptionPlan: formData.subscriptionPlan || 'monthly',
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ), // 1-year
        branches: [],
        users: [],
        menus: [],
        Order: [],
        Expense: [],
      };

      console.log('Creating company...');
      const companyResponse = await axios.post('/api/company', companyData);

      if (companyResponse.status === 201) {
        const companyId = companyResponse.data.id;
        console.log(`Company created with ID: ${companyId}`);

        // 2. Create Raw Material Ingredients FIRST
        console.log('Creating raw material ingredients...');
        const ingredientsMap = new Map<string, string>(); // To store created ingredients for reference

        // Extract all unique ingredients from menu items
        const allIngredients = new Set<string>();
        formData.menuCategories.forEach((category: any) => {
          category.menuItems.forEach((item: any) => {
            if (item.ingredients && Array.isArray(item.ingredients)) {
              item.ingredients.forEach((ing: MenuIngredient) => {
                if (ing.ingredient && ing.ingredient.name) {
                  allIngredients.add(
                    JSON.stringify({
                      name: ing.ingredient.name,
                      unit: ing.ingredient.unit,
                      companyId,
                    }),
                  );
                }
              });
            }
          });
        });

        // Create all ingredients first
        const ingredientPromises = Array.from(allIngredients).map(
          async ingredientJson => {
            const ingredient = JSON.parse(ingredientJson);
            try {
              const response = await axios.post('/api/ingredient', ingredient);
              if (response.status === 200) {
                ingredientsMap.set(ingredient.name, response.data.id);
                console.log(
                  `Ingredient "${ingredient.name}" created successfully.`,
                );
                return response.data;
              }
            } catch (error) {
              console.error(
                `Error creating ingredient ${ingredient.name}:`,
                error,
              );
            }
            return null;
          },
        );

        // Wait for all ingredients to be created
        await Promise.all(ingredientPromises);
        console.log(`Created ${ingredientsMap.size} ingredients successfully.`);

        // 3. Create Branch Managers & Branches
        console.log('Creating branches and managers...');
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
                role: 'manager',
                phone: '',
                branchId: null,
                status: 'pending',
              };

              const managerResponse = await axios.post(
                '/api/users',
                managerData,
              );

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
                  status: branch.status || 'active',
                  managerId: managerId,
                  createdBy: formData.userId,
                  companyId: companyId,
                };

                const branchResponse = await axios.post(
                  '/api/branches',
                  branchData,
                );

                if (branchResponse.status === 201) {
                  const branchId = branchResponse.data.id;

                  // 3.4 Update Manager Account with branchId
                  await axios.put(`/api/users/${managerId}`, {
                    branchId,
                    companyId,
                  });

                  // 3.5 Send email to manager with login credentials
                  await axios.post('/api/send-mail', {
                    to: branch.manager.email,
                    subject: 'Your Manager Account has been created',
                    body: `
                      Hello ${branch.manager.name},
                      Your account as a branch manager has been created. Please log in using:
                      
                      Email: ${branch.manager.email}
                      Temporary Password: ${randomPassword}

                      Please reset your password upon login.
                    `,
                  });

                  console.log(
                    `Branch "${branch.name}" and Manager account created successfully.`,
                  );
                  return { success: true, branch: branchResponse.data };
                }
              }
            } catch (error) {
              console.error(
                `Error creating branch and manager for ${branch.name}:`,
                error,
              );
            }
            return { success: false, branch: null };
          }),
        );

        console.log(
          `Created ${branchResponses.filter(r => r.success).length} branches successfully.`,
        );

        // 4. Create Menu Categories and Menu Items
        console.log('Creating menu categories and items...');
        const categoryPromises = formData.menuCategories.map(
          async (category: any) => {
            try {
              if (!category.name) {
                console.log('Skipping category with no name');
                return null;
              }

              const menuCategoriesResponse = await axios.post(
                '/api/menu/category',
                {
                  name: category.name,
                  description: category.description,
                  companyId: companyId,
                },
              );

              if (menuCategoriesResponse.status === 201) {
                const categoryId = menuCategoriesResponse.data.id;
                console.log(
                  `Menu Category "${category.name}" created with ID: ${categoryId}`,
                );

                // Create menu items for this category
                const menuItemPromises = category.menuItems.map(
                  async (item: any) => {
                    if (!item.name) {
                      console.log('Skipping menu item with no name');
                      return null;
                    }

                    const formattedPrices = item.priceTypes.map((p: any) => ({
                      name: p.name,
                      price: Number.parseFloat(p.price),
                    }));

                    try {
                      const imageUrl = await uploadBase64Image(
                        item.imageBase64,
                      );
                      console.log(imageUrl);
                      const menuResponse = await axios.post('/api/menu', {
                        name: item.name,
                        description: item.description,
                        prices: formattedPrices,
                        categoryId: categoryId,
                        imageUrl: imageUrl,
                        imageBase64: '',
                        companyId,
                      });

                      if (menuResponse.status === 201) {
                        const menuId = menuResponse.data.id;
                        console.log(
                          `Menu Item "${item.name}" created with ID: ${menuId}`,
                        );

                        // 5. Create Menu-Ingredient relationships
                        if (
                          item.ingredients &&
                          Array.isArray(item.ingredients)
                        ) {
                          const menuIngredientPromises = item.ingredients.map(
                            async (ing: MenuIngredient) => {
                              if (
                                ing.ingredient &&
                                ing.ingredient.name &&
                                ingredientsMap.has(ing.ingredient.name)
                              ) {
                                const ingredientId = ingredientsMap.get(
                                  ing.ingredient.name,
                                );

                                try {
                                  const menuIngResponse = await axios.post(
                                    '/api/menu_ingredient',
                                    {
                                      menuId,
                                      ingredientId,
                                      amount: ing.amount || 0,
                                    },
                                  );

                                  if (menuIngResponse.status === 200) {
                                    console.log(
                                      `Menu-ingredient relationship created for "${item.name}" and "${ing.ingredient.name}".`,
                                    );
                                    return menuIngResponse.data;
                                  }
                                } catch (error) {
                                  console.error(
                                    'Error creating menu-ingredient relationship:',
                                    error,
                                  );
                                }
                              } else {
                                console.warn(
                                  `Ingredient "${ing.ingredient?.name}" not found in ingredientsMap.`,
                                );
                              }
                              return null;
                            },
                          );

                          await Promise.all(menuIngredientPromises);
                        }

                        return menuResponse.data;
                      }
                    } catch (error) {
                      console.error(
                        `Error creating menu item "${item.name}":`,
                        error,
                      );
                    }
                    return null;
                  },
                );

                await Promise.all(menuItemPromises);
                return menuCategoriesResponse.data;
              }
            } catch (error) {
              console.error(
                `Error creating menu category "${category.name}":`,
                error,
              );
            }
            return null;
          },
        );

        await Promise.all(categoryPromises);

        // 6. Update company status to activated
        console.log('Activating company...');
        await axios.put('/api/company}', { isActivated: true, id: companyId });
        console.log('Company activated successfully!');

        return { success: true, companyId };
      }
    }

    return { success: false, error: 'User ID not provided' };
  } catch (error) {
    console.error('Error in completeBusiness:', error);
    return { success: false, error };
  }
}
