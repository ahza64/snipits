package testCases;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.net.MalformedURLException;
import java.util.Random;

import pages.CompanyPage;
import pages.DropDownMenu;
import pages.IngestionConfigPage;
import pages.LoginPage;
import pages.ProjectPage;
import pages.SchemaPage;
import pages.TaxonomyPage;
import pages.TaxonomyValuesPage;
import pages.UserPage;
import setup.Driver;
import setup.WebAppPage;

import static setup.WebAppPage.LOGGER;

public class AdminInterfaceE2ETests {

    private LoginPage loginPage;
    private CompanyPage companyPage;
    private DropDownMenu dropDownMenu;
    private ProjectPage projectPage;
    private IngestionConfigPage ingestionConfigPage;
    private UserPage userPage;
    private SchemaPage schemaPage;
    private TaxonomyPage taxonomyPage;
    private TaxonomyValuesPage taxonomyValuesPage;
    private int namePostFix;
    private int editNamePostFix;


    @BeforeClass(description = "Launching Chrome Broswer")
    public void LaunchingAdminInterfaceWebApp() {
        loginPage = new LoginPage(true);
    }

    @Test(priority = 1, description = "Performing login on AdminInterface WebApp")
    public void performLoginAdminInterfaceWebApp() throws MalformedURLException {
        companyPage = loginPage.login(Driver.getAdminUserName(), Driver.getAdminPassword());
    }

    @Test(priority = 2, description = "Adding a new company")
    public void verifyAddNewCompany() throws MalformedURLException
    {
        Random rand = new Random();
        namePostFix = rand.nextInt(1000);
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
        projectPage.verifyNewProjectIsAdded(namePostFix);
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
        ingestionConfigPage.verifyNewConfigIsAdded(namePostFix);
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
        userPage.verifyNewUserIsAdded(namePostFix);
        int badgeNumberAfterAddingUser = userPage.getBadgeCount();
        Assert.assertEquals(badgeNumberAfterAddingUser, badgeNumberBeforeAddingUser+1);
    }

    @Test(priority = 6, description = "Adding a new Schema")
    public void verifyAddNewSchema() throws MalformedURLException
    {
        dropDownMenu = userPage.clickDropDownMenu();
        schemaPage = dropDownMenu.openSchemaPage();
        schemaPage.selectCompany(namePostFix);
        schemaPage.selectProject(namePostFix);
        int countOnBadgeBeforeAdding = schemaPage.getBadgeCount();
        int countOnTableBeforeAdding = schemaPage.getEntriesInTable();
        schemaPage.addNewSchema(namePostFix);
        schemaPage.holdOnForACoupleOfSec();
        schemaPage.verifyNewSchemaIsAdded(namePostFix);
        int countOnBadgeAfterAdding = schemaPage.getBadgeCount();
        int countOnTableAfterAdding = schemaPage.getEntriesInTable();
        boolean verifyCount = ((countOnBadgeAfterAdding == countOnBadgeBeforeAdding + 1) && (countOnTableAfterAdding == countOnTableBeforeAdding + 1));
        Assert.assertTrue(verifyCount);
    }

    @Test(priority = 7, description = "Adding a new Taxonomy")
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
        taxonomyPage.verifyNewTaxonomyIsAdded(namePostFix);
        int countOnBadgeAfterAdding = taxonomyPage.getBadgeCount();
        int countOnTableAfterAdding = taxonomyPage.getEntriesInTable();
        if((countOnBadgeAfterAdding == countOnBadgeBeforeAdding + 1) && (countOnTableAfterAdding == countOnTableBeforeAdding + 1))
        {
            LOGGER.info("Valid Counts");
        }
        taxonomyPage.clickSaveChanges();
        boolean isTaxonomySaved = taxonomyPage.verifySaveChanges(namePostFix);
        Assert.assertTrue(isTaxonomySaved);
    }

    @Test(priority = 8, description = "Adding a new Taxonomy Field Value")
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

    @Test(priority = 9, description = "Switch the table view for taxonomy field values")
    public void verifySwitchNewTaxonomyValue() throws MalformedURLException
    {
        taxonomyValuesPage.viewValuesByScheme();
        boolean verifyViewSchema = taxonomyValuesPage.verifyTaxonomyValueInTable(namePostFix, namePostFix);
        if (!verifyViewSchema)
            LOGGER.severe("Values associated with selected Schema are not displayed");

        taxonomyValuesPage.viewValuesByTaxonomy();
        boolean verifyViewTaxonomy = taxonomyValuesPage.verifyTaxonomyValueInTable(namePostFix, namePostFix);
        if (!verifyViewTaxonomy)
            LOGGER.severe("Values associated with selected Taxonomy are not displayed");
        Assert.assertTrue(verifyViewSchema && verifyViewTaxonomy);
    }

    @Test(priority = 10, description = "Edit a taxonomy field value")
    public void verifyEditTaxonomyValue() throws MalformedURLException
    {
        Random rand = new Random();
        editNamePostFix = rand.nextInt(1000);
        taxonomyValuesPage.editTaxonomyValue(editNamePostFix);
        boolean isTaxonomyValueEdited = taxonomyValuesPage.verifyTaxonomyValueInTable(namePostFix, editNamePostFix);
        Assert.assertTrue(isTaxonomyValueEdited);
    }

    @Test(priority = 11, description = "Verify delete all taxonomy field values by schema")
    public void verifyDeleteTaxonomyValueBySchema() throws MalformedURLException
    {
        taxonomyValuesPage.viewValuesByScheme();
        int countOnBadgeBeforeDeleting = taxonomyValuesPage.getBadgeCount();
        int countOnTableBeforeDeleting = taxonomyValuesPage.getEntriesInTable();
        taxonomyValuesPage.removeAllValuesBySchema();
        int countOnBadgeAfterDeleting = taxonomyValuesPage.getBadgeCount();
        int countOnTableAfterDeleting = taxonomyValuesPage.getEntriesInTable();
        boolean isDeleted = (countOnBadgeBeforeDeleting > 0 && countOnTableBeforeDeleting > 0) &&
                (countOnBadgeAfterDeleting == 0 && countOnTableAfterDeleting == 0);
        Assert.assertTrue(isDeleted);
    }

    @Test(priority = 12, description = "Verify delete all taxonomy field value")
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
}