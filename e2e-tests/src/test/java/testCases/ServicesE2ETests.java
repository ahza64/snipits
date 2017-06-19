package testCases;

import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.awt.AWTException;
import java.net.MalformedURLException;
import java.util.Random;

import pagesIngestionInterface.DropDownMenuII;
import pagesIngestionInterface.LoginPageII;
import pagesIngestionInterface.UploadPage;
import pagesInternalAdmin.CompanyPage;
import pagesInternalAdmin.DropDownMenu;
import pagesInternalAdmin.IngestionConfigPage;
import pagesInternalAdmin.LoginPage;
import pagesInternalAdmin.ProjectPage;
import pagesInternalAdmin.SchemaPage;
import pagesInternalAdmin.TaxonomyPage;
import pagesInternalAdmin.TaxonomyValuesPage;
import pagesInternalAdmin.UserPage;
import setup.Driver;

import static constants.Constants.*;
import static setup.WebAppPage.LOGGER;

public class ServicesE2ETests {

    private LoginPage loginPage;
    private CompanyPage companyPage;
    private DropDownMenu dropDownMenu;
    private ProjectPage projectPage;
    private IngestionConfigPage ingestionConfigPage;
    private UserPage userPage;
    private SchemaPage schemaPage;
    private TaxonomyPage taxonomyPage;
    private TaxonomyValuesPage taxonomyValuesPage;
    private LoginPageII loginPageII;
    private UploadPage uploadPage;
    private DropDownMenuII dropDownMenuII;
    private int namePostFix;
    private int editNamePostFix;

    @BeforeClass(description = "Launching Chrome Broswer")
    public void LaunchingAdminInterfaceWebApp()
    {
        loginPage = new LoginPage(true);
    }

    @Test(priority = 1, description = "Performing login on AdminInterface WebApp")
    public void verifyLoginAdminInterfaceWebApp() throws MalformedURLException
    {
        companyPage = loginPage.login(Driver.getAdminUserName(), Driver.getAdminPassword());
    }

    @Test(priority = 2, description = "Adding a new company")
    public void verifyAddNewCompany() throws MalformedURLException
    {
        Random rand = new Random();
        namePostFix = rand.nextInt(10000);
        companyPage.addNewCompany(namePostFix);
        companyPage.holdOnForACoupleOfSec();
        boolean isNewCompanyAddedFound = companyPage.verifyNewCompanyIsAdded(namePostFix);
        Assert.assertTrue(isNewCompanyAddedFound);
    }
    @Test(priority = 3, description = "Adding a new project")
    public void verifyAddNewProject() throws MalformedURLException
    {
        dropDownMenu = companyPage.clickDropDownMenu();
        projectPage = dropDownMenu.openProjectPage();
        projectPage.selectCompany(namePostFix);
        int countOnBadgeBeforeAdding = projectPage.getBadgeCount();
        int countOnTableBeforeAdding = projectPage.getEntriesInTable();
        projectPage.addNewProject(namePostFix);
        projectPage.holdOnForACoupleOfSec();
        projectPage.verifyProject(namePostFix);
        int countOnBadgeAfterAdding = projectPage.getBadgeCount();
        int countOnTableAfterAdding = projectPage.getEntriesInTable();
        boolean verifyCount = ((countOnBadgeAfterAdding == countOnBadgeBeforeAdding + 1) && (countOnTableAfterAdding == countOnTableBeforeAdding + 1));
        Assert.assertTrue(verifyCount);
    }

    @Test(priority = 4, description = "Adding a new Ingestion Config")
    public void verifyAddNewIngestionConfig() throws MalformedURLException
    {
        dropDownMenu = projectPage.clickDropDownMenu();
        ingestionConfigPage = dropDownMenu.openIngestionConfigPage();
        ingestionConfigPage.selectCompany(namePostFix);
        ingestionConfigPage.selectProject(namePostFix);
        int countOnBadgeBeforeAdding = ingestionConfigPage.getBadgeCount();
        int countOnTableBeforeAdding = ingestionConfigPage.getEntriesInTable();
        ingestionConfigPage.addNewConfig(namePostFix);
        ingestionConfigPage.holdOnForACoupleOfSec();
        ingestionConfigPage.verifyConfig(namePostFix);
        int countOnBadgeAfterAdding = ingestionConfigPage.getBadgeCount();
        int countOnTableAfterAdding = projectPage.getEntriesInTable();
        boolean verifyCount = ((countOnBadgeAfterAdding == countOnBadgeBeforeAdding + 1) && (countOnTableAfterAdding == countOnTableBeforeAdding + 1));
        Assert.assertTrue(verifyCount);
    }

    @Test(priority = 5, description = "Adding a new User")
    public void verifyAddNewUser() throws MalformedURLException
    {
        dropDownMenu = ingestionConfigPage.clickDropDownMenu();
        userPage = dropDownMenu.openUserPage();
        int badgeNumberBeforeAddingUser = userPage.getBadgeCount();
        userPage.addNewUser(namePostFix);
        userPage.holdOnForACoupleOfSec();
        userPage.verifyUser(namePostFix);
        int badgeNumberAfterAddingUser = userPage.getBadgeCount();
        Assert.assertEquals(badgeNumberAfterAddingUser, badgeNumberBeforeAddingUser+1);
    }

    //Switching Apps: 	navigate to the ingestion_interface

    @Test(priority = 6, description = "Logout from Internal Admin App")
    public void verifyLogoutAdminInterfaceWebApp() throws MalformedURLException
    {
        projectPage.clickDropDownMenu();
        loginPage = dropDownMenu.performLogout();
        loginPage.closeBrowser();
    }

    @Test(priority = 7, description = "Verify Ingestion Interface Login Page")
    public void LaunchingIngestionInterfaceWebApp() throws MalformedURLException
    {
        loginPageII = new LoginPageII(true);
    }

    @Test(priority = 8, description = "Performing login on Ingestion Interface WebApp")
    public void verifyLoginIngestionInterfaceWebApp() throws MalformedURLException
    {
        uploadPage = loginPageII.login(USER_EMAIL + namePostFix + "@dispatchr.co", Driver.getingestionInterfacePassword());
        //uploadPage = loginPageII.login("user" + "1" + "@dispatchr.co", Driver.getingestionInterfacePassword());
    }

    @Test(priority = 9, description = "Filter files by company projects")
    public void verifySeeAllProjects() throws MalformedURLException
    {
        uploadPage.selectProject(namePostFix);
    }

    @Test(priority = 10, description = "Filter files by ingestion configuration type by company project")
    public void verifySeeAllConfigs() throws MalformedURLException
    {
        uploadPage.selectConfig(namePostFix);
    }

    @Test(priority = 11, description = "Upload a file for ingestion")
    public void verifyUploadFile() throws MalformedURLException, AWTException
    {
        int countOnTableBeforeAdding = uploadPage.getEntriesInTable();
        uploadPage.createFile(namePostFix);
        uploadPage.uploadFile(namePostFix);
        uploadPage.waitForUploadFileToComplete();
        int countOnTableAfterAdding = uploadPage.getEntriesInTable();
        boolean isFileShownOnHeatMap = uploadPage.verifyFileOnHeatMap(namePostFix);
        boolean verifyProject = isFileShownOnHeatMap && countOnTableAfterAdding == countOnTableBeforeAdding + 1;
        Assert.assertTrue(verifyProject);
    }

    @Test(priority = 12, description = "Re-Upload a file for ingestion", dependsOnMethods = { "verifyUploadFile" })
    public void verifyReUploadFile() throws MalformedURLException, AWTException
    {
        uploadPage.uploadFile(namePostFix);
        uploadPage.waitForUploadFileToComplete();
        boolean isReuploadErrorDisplayed = uploadPage.isErrorForReuploadDisplayed();
        Assert.assertTrue(isReuploadErrorDisplayed);
    }

    @Test(priority = 13, description = "Search for a file(s)", dependsOnMethods = { "verifyUploadFile" })
    public void verifySearhFiles() throws MalformedURLException
    {
        int countOnTableBeforeApplyingFilter = uploadPage.getEntriesInTable();
        uploadPage.typeInSearchField("fkjdvxn", 0);
        int countOnTableAfterApplyingFalseFilter = uploadPage.getEntriesInTable();
        String countOnPageAfterApplyingFalseFilter = uploadPage.getFilesCountFromPage();
        uploadPage.typeInSearchField(FILE_NAME, namePostFix);
        int countOnTableAfterApplyingValidFilter = uploadPage.getEntriesInTable();
        String countOnPageAfterApplyingValidFilter = uploadPage.getFilesCountFromPage();
        uploadPage.clearSearchField();
        uploadPage.holdOnForASec();
        uploadPage.getFilesCountFromPage();
        int countOnTableAfterRemovingFilter = uploadPage.getEntriesInTable();
        boolean verifySearch = (countOnTableBeforeApplyingFilter == countOnTableAfterRemovingFilter) &&
                (countOnTableAfterApplyingFalseFilter == 1) && (countOnTableAfterApplyingValidFilter > 1) &&
                countOnPageAfterApplyingFalseFilter.contains("0 of 0") &&
                countOnPageAfterApplyingValidFilter.contains("1 of 1");
        Assert.assertTrue(verifySearch);
    }

    @Test(priority = 14, description = "Logout from Internal Admin App")
    public void verifyLogoutIngestionInterfaceWebApp() throws MalformedURLException
    {
        uploadPage.deleteFile(namePostFix);
        dropDownMenuII = uploadPage.clickDropDownMenu();
        loginPageII = dropDownMenuII.performLogout();
        loginPageII.closeBrowser();
    }

    //Switching Apps: 	navigate to the internal_admin

    @Test(priority = 15, description = "Adding a new Schema")
    public void verifyAddNewSchema() throws MalformedURLException
    {
        loginPage = new LoginPage(true);
        companyPage = loginPage.login(Driver.getAdminUserName(), Driver.getAdminPassword());
        dropDownMenu = companyPage.clickDropDownMenu();
        schemaPage = dropDownMenu.openSchemaPage();
        schemaPage.selectCompany(namePostFix);
        schemaPage.selectProject(namePostFix);
        int countOnBadgeBeforeAdding = schemaPage.getBadgeCount();
        schemaPage.addNewSchema(namePostFix);
        schemaPage.holdOnForACoupleOfSec();
        schemaPage.verifySchema(namePostFix);
        int countOnBadgeAfterAdding = schemaPage.getBadgeCount();
        boolean verifyCount = (countOnBadgeAfterAdding == countOnBadgeBeforeAdding + 1);
        Assert.assertTrue(verifyCount);
    }

    @Test(priority = 16, description = "Adding a new Taxonomy")
    public void verifyAddNewTaxonomy() throws MalformedURLException
    {
        dropDownMenu = schemaPage.clickDropDownMenu();
        taxonomyPage = dropDownMenu.openTaxonomyPagePage();
        taxonomyPage.selectCompany(namePostFix);
        taxonomyPage.selectProject(namePostFix);
        taxonomyPage.selectSchema(namePostFix);
        int countOnBadgeBeforeAdding = taxonomyPage.getBadgeCount();
        int countOnTableBeforeAdding = taxonomyPage.getEntriesInTable();
        taxonomyPage.addNewTaxonomy(namePostFix);
        taxonomyPage.holdOnForACoupleOfSec();
        taxonomyPage.verifyTaxonomy(true, namePostFix);
        int countOnBadgeAfterAdding = taxonomyPage.getBadgeCount();
        int countOnTableAfterAdding = taxonomyPage.getEntriesInTable();
        if((countOnBadgeAfterAdding == countOnBadgeBeforeAdding + 1) && (countOnTableAfterAdding == countOnTableBeforeAdding + 1))
        {
            LOGGER.info("Valid Counts");
        }
        taxonomyPage.clickSaveChanges();
        boolean isTaxonomySaved = taxonomyPage.verifyTaxonomy(false, namePostFix);
        Assert.assertTrue(isTaxonomySaved);
    }

    @Test(priority = 17, description = "Adding a new Taxonomy Field Value")
    public void verifyAddNewTaxonomyValue() throws MalformedURLException
    {
        dropDownMenu = taxonomyPage.clickDropDownMenu();
        taxonomyValuesPage = dropDownMenu.openTaxonomyValuePagePage();
        taxonomyValuesPage.selectCompany(namePostFix);
        taxonomyValuesPage.selectProject(namePostFix);
        taxonomyValuesPage.selectSchema(namePostFix);
        taxonomyValuesPage.selectTaxonomy(namePostFix);
        int countOnBadgeBeforeAdding = taxonomyValuesPage.getBadgeCount();
        int countOnTableBeforeAdding = taxonomyValuesPage.getEntriesInTable();
        taxonomyValuesPage.addNewTaxonomyValues(namePostFix);
        taxonomyValuesPage.holdOnForACoupleOfSec();
        taxonomyValuesPage.verifyTaxonomyValueInTable(namePostFix, namePostFix);
        int countOnBadgeAfterAdding = taxonomyValuesPage.getBadgeCount();
        int countOnTableAfterAdding = taxonomyValuesPage.getEntriesInTable();
        boolean verifyCount = ((countOnBadgeAfterAdding == countOnBadgeBeforeAdding + 1) && (countOnTableAfterAdding == countOnTableBeforeAdding + 1));
        Assert.assertTrue(verifyCount);
    }

    @Test(priority = 18, description = "Switch the table view for taxonomy field values")
    public void verifySwitchNewTaxonomyValue() throws MalformedURLException
    {
        taxonomyValuesPage.viewValuesBySchema();
        boolean verifyViewSchema = taxonomyValuesPage.verifyTaxonomyValueInTable(namePostFix, namePostFix);
        if (!verifyViewSchema)
            LOGGER.severe("Values associated with selected Schema are not displayed");

        taxonomyValuesPage.viewValuesByTaxonomy();
        boolean verifyViewTaxonomy = taxonomyValuesPage.verifyTaxonomyValueInTable(namePostFix, namePostFix);
        if (!verifyViewTaxonomy)
            LOGGER.severe("Values associated with selected Taxonomy are not displayed");
        Assert.assertTrue(verifyViewSchema && verifyViewTaxonomy);
    }

    @Test(priority = 19, description = "Edit a taxonomy field value")
    public void verifyEditTaxonomyValue() throws MalformedURLException
    {
        Random rand = new Random();
        editNamePostFix = rand.nextInt(10000);
        taxonomyValuesPage.editTaxonomyValue(editNamePostFix);
        boolean isTaxonomyValueEdited = taxonomyValuesPage.verifyTaxonomyValueInTable(namePostFix, editNamePostFix);
        Assert.assertTrue(isTaxonomyValueEdited);
    }

    @Test(priority = 20, description = "Verify delete all taxonomy field values by schema")
    public void verifyDeleteTaxonomyValueBySchema() throws MalformedURLException
    {
        taxonomyValuesPage.viewValuesBySchema();
        int countOnBadgeBeforeDeleting = taxonomyValuesPage.getBadgeCount();
        int countOnTableBeforeDeleting = taxonomyValuesPage.getEntriesInTable();
        taxonomyValuesPage.removeAllValuesBySchema();
        int countOnBadgeAfterDeleting = taxonomyValuesPage.getBadgeCount();
        int countOnTableAfterDeleting = taxonomyValuesPage.getEntriesInTable();
        boolean isDeleted = (countOnBadgeBeforeDeleting > 0 && countOnTableBeforeDeleting > 0) &&
                (countOnBadgeAfterDeleting == 0 && countOnTableAfterDeleting == 0);
        Assert.assertTrue(isDeleted);
    }

    @Test(priority = 21, description = "Verify delete all taxonomy field value")
    public void verifyDeleteTaxonomyValue() throws MalformedURLException
    {
        taxonomyValuesPage.addNewTaxonomyValues(namePostFix);
        int countOnBadgeBeforeDeleting = taxonomyValuesPage.getBadgeCount();
        int countOnTableBeforeDeleting = taxonomyValuesPage.getEntriesInTable();
        String deletedTaxonomyValue = taxonomyValuesPage.deleteTaxonomyValue();
        LOGGER.info(deletedTaxonomyValue);
        taxonomyValuesPage.holdOnForACoupleOfSec();
        boolean verifyDeletion = taxonomyValuesPage.verifyTaxonomyValueInTable(namePostFix, namePostFix);
        int countOnBadgeAfterDeleting = taxonomyValuesPage.getBadgeCount();
        int countOnTableAfterDeleting = taxonomyValuesPage.getEntriesInTable();
        boolean isDeleted = ((countOnBadgeBeforeDeleting == countOnBadgeAfterDeleting + 1) &&
                (countOnTableBeforeDeleting == countOnTableAfterDeleting + 1) && !verifyDeletion);
        Assert.assertTrue(isDeleted);
    }

    @Test(priority = 22, description = "Edit a taxonomy field name")
    public void verifyEditTaxonomy() throws MalformedURLException
    {
        dropDownMenu = taxonomyValuesPage.clickDropDownMenu();
        taxonomyPage = dropDownMenu.openTaxonomyPagePage();
        taxonomyPage.selectCompany(namePostFix);
        taxonomyPage.selectProject(namePostFix);
        taxonomyPage.selectSchema(namePostFix);
        taxonomyPage.editTaxonomyFieldName(editNamePostFix);
        taxonomyPage.holdOnForACoupleOfSec();
        taxonomyPage.clickSaveChanges();
        taxonomyPage.holdOnForACoupleOfSec();
        boolean isTaxonomySaved = taxonomyPage.verifyTaxonomy(false, editNamePostFix);
        Assert.assertTrue(isTaxonomySaved);
    }

    @Test(priority = 23, description = "Delete a taxonomy field name")
    public void verifyDeleteTaxonomy() throws MalformedURLException
    {
        int countOnBadgeBeforeDeleting = taxonomyPage.getBadgeCount();
        int countOnTableBeforeDeleting = taxonomyPage.getEntriesInTable();
        String deletedTaxonomyValue = taxonomyPage.deleteTaxonomyFieldName();
        LOGGER.info(deletedTaxonomyValue);
        taxonomyPage.holdOnForACoupleOfSec();
        taxonomyPage.clickSaveChanges();
        taxonomyPage.holdOnForACoupleOfSec();
        boolean verifyDeletion = taxonomyPage.verifyTaxonomy(true, editNamePostFix);
        int countOnBadgeAfterDeleting = taxonomyPage.getBadgeCount();
        int countOnTableAfterDeleting = taxonomyPage.getEntriesInTable();
        boolean isDeleted = ((countOnBadgeBeforeDeleting == countOnBadgeAfterDeleting + 1) &&
                (countOnTableBeforeDeleting == countOnTableAfterDeleting + 1) && !verifyDeletion);
        Assert.assertTrue(isDeleted);
    }

    @Test(priority = 24, description = "Edit a Schema")
    public void verifyEditSchema() throws MalformedURLException
    {
        dropDownMenu = taxonomyPage.clickDropDownMenu();
        schemaPage = dropDownMenu.openSchemaPage();
        schemaPage.selectCompany(namePostFix);
        schemaPage.selectProject(namePostFix);
        schemaPage.selectSchema(namePostFix);
        schemaPage.openEditSchemaPopUp();
        String dataTypeSelect = schemaPage.editSchema(namePostFix);
        boolean verifyModuleTable = schemaPage.verifyFieldModuleTable(namePostFix, dataTypeSelect);
        schemaPage.clickSaveButton();
        boolean verifySchemaTable = schemaPage.verifyFieldSchemaTable(namePostFix, dataTypeSelect);
        schemaPage.openEditSchemaPopUp();
        schemaPage.deleteSchemaField(namePostFix, dataTypeSelect);
        boolean verifyModuleTableAfterDelete = schemaPage.verifyFieldModuleTable(namePostFix, dataTypeSelect);
        schemaPage.clickSaveButton();
        boolean verifySchemaTableAfterDelete = schemaPage.verifyFieldSchemaTable(namePostFix, dataTypeSelect);
        boolean isEdited = verifyModuleTable && verifySchemaTable && !verifyModuleTableAfterDelete && !verifySchemaTableAfterDelete;
        Assert.assertTrue(isEdited);
    }

    @Test(priority = 25, description = "Delete Schema")
    public void verifyDeleteSchema() throws MalformedURLException
    {
        schemaPage.selectCompany(namePostFix);
        schemaPage.selectProject(namePostFix);
        int countOnBadgeBeforeDeleting = schemaPage.getBadgeCount();
        schemaPage.openEditSchemaPopUp();
        schemaPage.deleteSchema();
        boolean verifyDeletion = schemaPage.verifySchema(namePostFix);
        schemaPage.holdOnForASec();
        int countOnBadgeAfterDeleting = schemaPage.getBadgeCount();
        boolean isDeleted = ((countOnBadgeBeforeDeleting == countOnBadgeAfterDeleting + 1) && !verifyDeletion);
        Assert.assertTrue(isDeleted);
    }

    @Test(priority = 26, description = "Edit User")
    public void verifyEditUser() throws MalformedURLException
    {
        dropDownMenu = schemaPage.clickDropDownMenu();
        userPage = dropDownMenu.openUserPage();
        int userToEdit = userPage.verifyUser(namePostFix);
        userPage.editUser(editNamePostFix, userToEdit);
        userPage.holdOnForACoupleOfSec();
        userPage.verifyUser(editNamePostFix);
    }

    @Test(priority = 27, description = "Activate/Deactivate a user")
    public void verifyActivateDeactivateUser() throws MalformedURLException
    {
        int userToEdit = userPage.verifyUser(editNamePostFix);
        userPage.toggleStatusButton(userToEdit);
        boolean statusAfterDeactivatingFromTable = userPage.getUserStatusFromTable(userToEdit);
        boolean statusAfterDeactivatingFromCheckbox = userPage.getUserStatusFromCheckbox(userToEdit);

        userPage.toggleStatusButton(userToEdit);
        boolean statusAfterActivatingFromTable = userPage.getUserStatusFromTable(userToEdit);
        boolean statusAfterActivatingFromCheckbox = userPage.getUserStatusFromCheckbox(userToEdit);

        boolean isUserValid = statusAfterActivatingFromCheckbox == statusAfterActivatingFromTable &&
                statusAfterDeactivatingFromCheckbox == statusAfterDeactivatingFromTable;
        Assert.assertTrue(isUserValid);
    }

    @Test(priority = 28, description = "Delete a user")
    public void verifyDeleteUser() throws MalformedURLException
    {
        int isUserPresent = 0;
        int badgeNumberBeforeDeletingUser = userPage.getBadgeCount();
        int userToEdit = userPage.verifyUser(editNamePostFix);
        LOGGER.info(String.valueOf(userToEdit));
        if(userToEdit != -1)
        {
            userPage.deleteUser(userToEdit);
            userPage.holdOnForACoupleOfSec();
            isUserPresent = userPage.verifyUser(editNamePostFix);
            LOGGER.info(String.valueOf(isUserPresent));
        }
        int badgeNumberAfterDeletingUser = userPage.getBadgeCount();
        boolean isDeleteUser = ((badgeNumberAfterDeletingUser == badgeNumberBeforeDeletingUser-1) && (isUserPresent == -1));
        Assert.assertTrue(isDeleteUser);
    }

    @Test(priority = 29, description = "Edit Ingestion Configuration")
    public void verifyEditIngestionConfig() throws MalformedURLException
    {
        dropDownMenu = userPage.clickDropDownMenu();
        ingestionConfigPage = dropDownMenu.openIngestionConfigPage();
        ingestionConfigPage.selectCompany(namePostFix);
        ingestionConfigPage.selectProject(namePostFix);
        ingestionConfigPage.openEditConfigPopUp(namePostFix);
        ingestionConfigPage.editConfig(namePostFix);
        ingestionConfigPage.openEditConfigPopUp(namePostFix);
        boolean isConfigEdited = ingestionConfigPage.verifyEditConfig(namePostFix);
        Assert.assertTrue(isConfigEdited);
    }

    @Test(priority = 30, description = "Delete Ingestion Configuration")
    public void verifyDeleteIngestionConfig() throws MalformedURLException
    {
        int countOnBadgeBeforeDeleting = ingestionConfigPage.getBadgeCount();
        int countOnTableBeforeDeleting = ingestionConfigPage.getEntriesInTable();
        ingestionConfigPage.openEditConfigPopUp(namePostFix);
        ingestionConfigPage.deleteConfig();
        boolean isConfigDeleted = ingestionConfigPage.verifyConfig(namePostFix);
        int countOnBadgeAfterDeleting = ingestionConfigPage.getBadgeCount();
        int countOnTableAfterDeleting = projectPage.getEntriesInTable();
        boolean verifyConfig = !isConfigDeleted && (countOnBadgeBeforeDeleting == countOnBadgeAfterDeleting + 1) &&
                (countOnTableBeforeDeleting == countOnTableAfterDeleting + 1);
        Assert.assertTrue(verifyConfig);
    }

    @Test(priority = 31, description = "Activate/Deactivate a Work Project")
    public void verifyActivateDeactivateProject() throws MalformedURLException
    {
        dropDownMenu = ingestionConfigPage.clickDropDownMenu();
        projectPage = dropDownMenu.openProjectPage();
        projectPage.selectCompany(namePostFix);
        boolean statusBeforeDeactivatingFromCheckbox = projectPage.getProjectStatusFromCheckbox(namePostFix);
        boolean statusBeforeDeactivatingFromCheckColor = projectPage.getStatusCheckBoxColor(namePostFix);
        projectPage.toggleStatusButton(namePostFix);
        boolean statusAfterDeactivatingFromCheckbox = projectPage.getProjectStatusFromCheckbox(namePostFix);
        boolean statusAfterDeactivatingFromCheckColor = projectPage.getStatusCheckBoxColor(namePostFix);
        boolean verifyProject = statusBeforeDeactivatingFromCheckbox && statusBeforeDeactivatingFromCheckColor &&
                !statusAfterDeactivatingFromCheckbox && !statusAfterDeactivatingFromCheckColor;
        Assert.assertTrue(verifyProject);

    }

    @Test(priority = 32, description = "Delete a Work Project")
    public void verifyDeleteProject() throws MalformedURLException
    {
        int countOnBadgeBeforeDeleting = projectPage.getBadgeCount();
        int countOnTableBeforeDeleting = projectPage.getEntriesInTable();
        projectPage.openEditConfigPopUp(namePostFix);
        projectPage.deleteProject();
        projectPage.holdOnForACoupleOfSec();
        boolean isProjectDeleted = projectPage.verifyProject(namePostFix);
        int countOnBadgeAfterDeleting = projectPage.getBadgeCount();
        int countOnTableAfterDeleting = projectPage.getEntriesInTable();
        boolean verifyCount = (!isProjectDeleted && (countOnBadgeBeforeDeleting == countOnBadgeAfterDeleting + 1) &&
                (countOnTableBeforeDeleting == countOnTableAfterDeleting + 1));
        Assert.assertTrue(verifyCount);
    }
}