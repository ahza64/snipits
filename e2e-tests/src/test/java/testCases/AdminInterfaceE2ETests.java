package testCases;

import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.net.MalformedURLException;

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
}