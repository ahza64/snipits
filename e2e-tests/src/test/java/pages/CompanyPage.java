package pages;

import org.openqa.selenium.By;

import java.net.MalformedURLException;

import setup.WebAppPage;

/**
 * Created by az on 5/15/17.
 */

public class CompanyPage extends WebAppPage {

    private String addCompanyButton = ".//*[@class='col-lg-8 col-md-8 col-sm-8 col-xs-8']/descendant::span[text()='Add company']";

    CompanyPage() throws MalformedURLException
    {
        waitForVisible(By.xpath(addCompanyButton));
        waitForPageLoadComplete();
        holdOnForACoupleOfSec();
    }
}
