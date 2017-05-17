package testCases;

import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.net.MalformedURLException;
import java.util.Random;

import pages.CompanyPage;
import pages.LoginPage;
import setup.Driver;

public class AdminInterfaceE2ETests {
    protected LoginPage loginPage;
    protected CompanyPage companyPage;

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
        int companyNamePostFix = rand.nextInt(1000);
        companyPage.addNewCompany(companyNamePostFix);
        companyPage.holdOnForACoupleOfSec();
        boolean isNewCompanyAddedFound = companyPage.verifyNewCompanyIsAdded(companyNamePostFix);
        Assert.assertTrue(isNewCompanyAddedFound);
    }
}