package testCases;

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
import pages.UserPage;
import setup.Driver;

public class AdminInterfaceE2ETests {
    protected LoginPage loginPage;
    protected CompanyPage companyPage;
    protected DropDownMenu dropDownMenu;
    protected ProjectPage projectPage;
    protected IngestionConfigPage ingestionConfigPage;
    protected UserPage userPage;
    protected SchemaPage schemaPage;
    protected int namePostFix;

    @BeforeClass(description = "Launching Chrome Broswer")
    public void LaunchingAdminInterfaceWebApp()
    {
        loginPage = new LoginPage(true);
    }

    @Test(priority = 1, description = "Performing login on AdminInterface WebApp")
    public void performLoginAdminInterfaceWebApp() throws MalformedURLException
    {
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
        dropDownMenu = companyPage.clickDropDownMenu();
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
}