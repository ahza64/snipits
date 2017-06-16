package pagesInternalAdmin;

import org.openqa.selenium.By;

import java.net.MalformedURLException;

import setup.WebAppPage;

import static constants.Constants.*;

/**
 * Created by az on 5/16/17.
 */

public class UserPage extends WebAppPage {

    private String addUserButton = ".//span[text()='Add user']";
    private String addUserFormCancelButton = ".//span[text()='Cancel']";
    private String addUserFormConfirmButton = ".//span[text()='Confirm']";
    private String addUserFormFirstNameField = ".//td[text()='First Name']/parent::tr/descendant::input[1]";
    private String addUserFormSecondNameField = ".//td[text()='Last Name']/following-sibling::td/descendant::input[1]";
    private String addUserFormEmailField = ".//td[text()='Email']/parent::tr/descendant::input[1]";
    private String addUserFormCompanyField = ".//td[text()='Company']/parent::tr/descendant::button";
    private String selectCompanyDropDown = ".//*[@style='z-index: 1000; max-height: 500px; overflow-y: auto; width: 320px;']";
    private String addUserFormPasswordField = ".//td[text()='Password']/parent::tr/descendant::input[1]";
    private String addUserFormPasswordConfirmField = ".//td[text()='Confirm']/following-sibling::td/descendant::input";
    private String userTable = ".//*[@class='row'][3]";
    private String dropDownButton = ".//*[@class='dropdown']/a";

    UserPage() throws MalformedURLException
    {
        waitForVisible(By.xpath(addUserButton));
        waitForPageLoadComplete();
        holdOnForACoupleOfSec();
    }

    private void waitForAddUserFormToDisplay()
    {
        try {
            waitForVisible(By.xpath(addUserFormCancelButton));
            LOGGER.info("User Form is displayed");
        } catch (MalformedURLException e) {
            LOGGER.info("User Form is not displayed");
        }
    }

    public void addNewUser(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(addUserButton));
        waitForAddUserFormToDisplay();
        driver.findElement(By.xpath(addUserFormFirstNameField)).sendKeys(USER_FNAME + namePostFix);
        driver.findElement(By.xpath(addUserFormSecondNameField)).sendKeys(USER_LNAME + namePostFix);
        driver.findElement(By.xpath(addUserFormEmailField)).sendKeys(USER_EMAIL + namePostFix + "@dispatchr.co");
        clickOnElement(By.xpath(addUserFormCompanyField));
        scrollToElement(driver.findElement(By.xpath(selectCompanyDropDown + "/descendant::div[text()='" + COMPANY_NAME + namePostFix + "']")));
        clickOnElement(By.xpath(selectCompanyDropDown + "/descendant::div[text()='" + COMPANY_NAME + namePostFix + "']"));
        holdOnForASec();
        driver.findElement(By.xpath(addUserFormPasswordField)).sendKeys(USER_PASSWORD);
        holdOnForASec();
        driver.findElement(By.xpath(addUserFormPasswordConfirmField)).sendKeys(USER_PASSWORD);
        holdOnForASec();
        clickOnElement(By.xpath(addUserFormConfirmButton));
        LOGGER.info("User is Added");
        waitForElementToDisappear(By.xpath(addUserFormCancelButton));
    }

    //if user found then return the index
    //if user is not found, then return -1
    public int verifyUser(int namePostFix)
    {
        int userIndex = 2;
        int userFoundIndex = -1;

        if(isElementPresentAndDisplayedByLocator(By.xpath(userTable)))
        {
            int totalRowsInUserTable = driver.findElements(By.xpath(userTable + "/descendant::tr")).size();
            LOGGER.info(String.valueOf(totalRowsInUserTable));
            if (totalRowsInUserTable > 1)
            {
                String userNameDisplayed;

                for (; userIndex < totalRowsInUserTable + 1; userIndex++)
                {
                    userNameDisplayed = driver.findElement(By.xpath(userTable + "/descendant::tr[" + userIndex + "]/td[2]")).getText();
                    if (userNameDisplayed.contentEquals(USER_FNAME + namePostFix + " " + USER_LNAME + namePostFix))
                    {
                        String companyName;
                        companyName = driver.findElement(By.xpath(userTable + "/descendant::tr[" + userIndex + "]/td[4]")).getText();
                        LOGGER.info(companyName);
                        LOGGER.info("User is Found");
                        userFoundIndex = userIndex - 1;
                        break;
                    }
                }
            } else
            {
                LOGGER.info("No User on Table is Found");
            }
        }
        return userFoundIndex;
    }

    public int getBadgeCount()
    {
        return driver.findElements(By.xpath(userTable + "/descendant::tr")).size() - 1;
    }

    public DropDownMenu clickDropDownMenu()
    {
        clickOnElement(By.xpath(dropDownButton));
        return new DropDownMenu();
    }

    public void editUser(int namePostFix, int userToEdit) throws MalformedURLException
    {
        clickOnElement(By.xpath(".//tbody/tr[" + userToEdit + "]/td/descendant::span[text()='EDIT']"));
        waitForAddUserFormToDisplay();
        driver.findElement(By.xpath(addUserFormFirstNameField)).clear();
        driver.findElement(By.xpath(addUserFormFirstNameField)).sendKeys(USER_FNAME + namePostFix);
        driver.findElement(By.xpath(addUserFormSecondNameField)).clear();
        driver.findElement(By.xpath(addUserFormSecondNameField)).sendKeys(USER_LNAME + namePostFix);
        driver.findElement(By.xpath(addUserFormEmailField)).clear();
        driver.findElement(By.xpath(addUserFormEmailField)).sendKeys(USER_EMAIL + namePostFix + "@dispatchr.co");
        holdOnForASec();
        clickOnElement(By.xpath(addUserFormConfirmButton));
        LOGGER.info("User is Edited");
        waitForElementToDisappear(By.xpath(addUserFormCancelButton));
    }

    public boolean getUserStatusFromTable(int userToVerify)
    {
        boolean isUserActive = false;
        String userStatus = driver.findElement(By.xpath(".//tbody/tr[" + userToVerify + "]/td[6]")).getText();
        if(userStatus.contentEquals("active"))
            isUserActive = true;
        return isUserActive;
    }

    public boolean getUserStatusFromCheckbox(int userToVerify)
    {
        boolean isUserActive = false;
        String userStatus = driver.findElement(By.xpath(".//tbody/tr[" + userToVerify + "]/td[7]/div/input")).getAttribute("checked");
        if(userStatus != null)
            isUserActive = true;
        return isUserActive;
    }

    public void toggleStatusButton(int userToVerify)
    {
        clickOnElement(By.xpath(".//tbody/tr[" + userToVerify + "]/td[7]/div/input"));
        holdOnForASec();
    }

    public void deleteUser(int userToVerify) throws MalformedURLException
    {
        clickOnElement(By.xpath(".//tbody/tr[" + userToVerify + "]/td[9]"));
        waitForAddUserFormToDisplay();
        clickOnElement(By.xpath(addUserFormConfirmButton));
        waitForElementToDisappear(By.xpath(addUserFormConfirmButton));
    }
}
