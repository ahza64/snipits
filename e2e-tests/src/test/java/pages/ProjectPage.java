package pages;

import org.openqa.selenium.By;

import java.net.MalformedURLException;

import setup.WebAppPage;

/**
 * Created by az on 5/16/17.
 */

public class ProjectPage extends WebAppPage {

    private String selectCompanyButton = ".//label[text()='Company']/parent::div/div/descendant::button";
    private String selectCompanyDropDown = ".//*[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 256px;']";
    private String addProjectButton = ".//*[@class='col-lg-2 col-md-2 col-sm-0 col-xs-0']/descendant::span[text()='Add Work Project']";
    private String addProjectFormCancelButton = ".//span[text()='Cancel']";
    private String addProjectFormConfirmButton = ".//span[text()='Confirm']";
    private String addProjectNameField = ".//label[text()='Work Project Name']/following-sibling::input";
    private String projectTable = ".//*[@class='row']";
    private String badgeCount = ".//*[text()='Total Work Projects Found']/div/span";

    ProjectPage() throws MalformedURLException
    {
        waitForVisible(By.xpath(addProjectButton));
        waitForPageLoadComplete();
        holdOnForACoupleOfSec();
    }

    private void waitForAddProjectFormToDisplay()
    {
        try {
            waitForVisible(By.xpath(addProjectFormCancelButton));
            LOGGER.info("Add Company Form is displayed");
        } catch (MalformedURLException e) {
            LOGGER.info("Add Company Form is not displayed");
        }
    }

    public void selectCompany(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(selectCompanyButton));
        waitForVisible(By.xpath(selectCompanyDropDown));
        holdOnForASec();
        clickOnElement(By.xpath(selectCompanyDropDown + "/descendant::div[text()='Company" + namePostFix + "']"));
        LOGGER.info("Company is Selected");
        holdOnForASec();
    }

    public void addNewProject(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(addProjectButton));
        waitForAddProjectFormToDisplay();
        driver.findElement(By.xpath(addProjectNameField)).sendKeys("Project" + namePostFix);
        clickOnElement(By.xpath(addProjectFormConfirmButton));
        LOGGER.info("Project is Added");
    }

    public boolean verifyNewProjectIsAdded(int namePostFix)
    {
        boolean isNewProjectAdded = false;

        if(isElementPresentAndDisplayedByLocator(By.xpath(projectTable)))
        {
            int totalRowsInProjectTable = driver.findElements(By.xpath(".//*[@class='row']/descendant::tr")).size();
            LOGGER.info(String.valueOf(totalRowsInProjectTable));
            String projectNameDisplayed;

            for(int i=2; i<totalRowsInProjectTable+2; i++)
            {
                projectNameDisplayed = driver.findElement(By.xpath(".//*[@class='row']/descendant::tr[" + i + "]/td[2]")).getText();
                LOGGER.info(projectNameDisplayed);
                if(projectNameDisplayed.contentEquals("Project" + namePostFix))
                {
                    LOGGER.info("Project Added is Found");
                    isNewProjectAdded = true;
                    break;
                }
            }
        }

        return isNewProjectAdded;
    }

    public int getBadgeCount()
    {
        return Integer.parseInt(driver.findElement(By.xpath(badgeCount)).getText());
    }
}
