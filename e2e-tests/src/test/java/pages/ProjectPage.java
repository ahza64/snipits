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
    private String addProjectButton = ".//span[text()='Add Work Project']";
    private String addProjectFormCancelButton = ".//span[text()='Cancel']";
    private String addProjectFormConfirmButton = ".//span[text()='Confirm']";
    private String addProjectNameField = ".//label[text()='Work Project Name']/following-sibling::input";
    private String projectTable = ".//*[@class='row']";
    private String badgeCount = ".//*[text()='Total Work Projects Found']/div/span";
    private String dropDownButton = ".//*[@class='dropdown']/a";

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
            LOGGER.info("Add Project Form is displayed");
        } catch (MalformedURLException e) {
            LOGGER.info("Add Project Form is not displayed");
        }
    }

    public void selectCompany(int namePostFix) throws MalformedURLException
    {
        selectEntity("Company", namePostFix, selectCompanyButton, selectCompanyDropDown);
    }

    public void addNewProject(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(addProjectButton));
        waitForAddProjectFormToDisplay();
        driver.findElement(By.xpath(addProjectNameField)).sendKeys("Project" + namePostFix);
        clickOnElement(By.xpath(addProjectFormConfirmButton));
        LOGGER.info("Project is Added");
        waitForElementToDisappear(By.xpath(addProjectFormCancelButton));
    }

    public boolean verifyNewProjectIsAdded(int namePostFix)
    {
        boolean isNewProjectAdded = false;

        if(isElementPresentAndDisplayedByLocator(By.xpath(projectTable)))
        {
            int totalRowsInProjectTable = driver.findElements(By.xpath(".//*[@class='row']/descendant::tr")).size();
            LOGGER.info(String.valueOf(totalRowsInProjectTable));
            if(totalRowsInProjectTable > 1)
            {
                String projectNameDisplayed;

                for(int i=2; i<totalRowsInProjectTable+2; i++)
                {
                    projectNameDisplayed = driver.findElement(By.xpath(".//*[@class='row']/descendant::tr[" + i + "]/td[2]")).getText();
                    if(projectNameDisplayed.contentEquals("Project" + namePostFix))
                    {
                        LOGGER.info("Project Added is Found");
                        isNewProjectAdded = true;
                        break;
                    }
                }
            }
            else
            {
                isNewProjectAdded = false;
                LOGGER.info("No Project on Table is Found");
            }
        }


        return isNewProjectAdded;
    }

    public int getBadgeCount()
    {
        return Integer.parseInt(driver.findElement(By.xpath(badgeCount)).getText());
    }

    public DropDownMenu clickDropDownMenu()
    {
        clickOnElement(By.xpath(dropDownButton));
        return new DropDownMenu();
    }

    public boolean getProjectStatusFromCheckbox(int namePostFix)
    {
        boolean isProjectActive = false;
        String userStatus = driver.findElement(By.xpath(".//td[text()='Project" + namePostFix + "']/parent::tr/descendant::input")).getAttribute("checked");
        if(userStatus != null)
            isProjectActive = true;
        return isProjectActive;
    }

    public boolean getStatusCheckBoxColor(int namePostFix)
    {
        boolean isProjectActive = false;
        String projectStatus = driver.findElement(By.xpath(".//td[text()='Project" + namePostFix + "']/parent::tr/descendant::input/parent::div/div/div/div")).getAttribute("style");
        projectStatus = projectStatus.substring(projectStatus.indexOf("rgb"), projectStatus.indexOf(");") + 1);
        LOGGER.info(projectStatus);
        if(projectStatus.contentEquals("rgba(0, 188, 212, 0.5)"))
            isProjectActive = true;

        return isProjectActive;
    }

    public void toggleStatusButton(int namePostFix)
    {
        clickOnElement(By.xpath(".//td[text()='Project" + namePostFix + "']/parent::tr/descendant::input"));
        holdOnForACoupleOfSec();
    }
}
