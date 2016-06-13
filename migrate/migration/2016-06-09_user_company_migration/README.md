#USAGE

##Add Company to Users(Web App Users)

cd into `migrate` and run  `node migration/2016-06-09_user_company_migration/add_company_to_managers.js addCompanyToManagers CSV_FILE.csv`

##Add Company to CUFs(Mobile App Users)

cd into `migrate` and run  `node migration/2016-06-09_user_company_migration/add_company_to_cufs.js addCompanyToCufs CSV_FILE.csv`

##Specifically for this Company field migration

1. cd into `migrate`
2. run `node migration/2016-06-09_user_company_migration/add_company_to_managers.js addCompanyToManagers ManagR_Users.csv`
3. run `node migration/2016-06-09_user_company_migration/add_company_to_managers.js addCompanyToManagers PlanR_Users.csv`
4. run `node migration/2016-06-09_user_company_migration/add_company_to_cufs.js addCompanyToCufs ManagR_Users.csv`
5. run `node migration/2016-06-09_user_company_migration/add_company_to_cufs.js addCompanyToCufs PlanR_Users.csv`

## Return Cufs with no company field

run `node migration/2016-06-09_user_company_migration/add_company_to_cufs.js cufsWithNoCompany`
