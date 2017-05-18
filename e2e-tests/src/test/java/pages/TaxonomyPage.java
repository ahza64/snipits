package pages;

import org.openqa.selenium.By;

import java.net.MalformedURLException;

import setup.WebAppPage;

/**
 * Created by az on 5/18/17.
 */

public class TaxonomyPage extends WebAppPage {

    private String selectCompanyButton = ".//label[text()='Company']/parent::div/div/descendant::button";
    private String selectProjectButton = "//label[text()='Work Project']/parent::div/div/descendant::button";
    private String selectSchemaButton = "//label[text()='Project Schemas']/parent::div/div/descendant::button";
    private String selectCompanyDropDown = ".//*[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 256px;']";
    private String selectProjectDropDown = ".//*[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 256px;']";
    private String selectSchemaDropDown = ".//*[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 256px;']";
    private String addTaxonomyButton = ".//span[text()='Add Taxonomy']";
    private String addTaxonomyFormCancelButton = ".//span[text()='Cancel']";
    private String addTaxonomyFormConfirmButton = ".//span[text()='Confirm']";
    private String addTaxonomyCompanyField = ".//td[text()='Company']/parent::tr/descendant::input";
    private String addTaxonomyProjectField = ".//td[text()='Work Project']/parent::tr/descendant::input";
    private String addTaxonomySchemaField = ".//td[text()='Schema Name']/parent::tr/descendant::input";
    private String addTaxonomyFieldNameField = ".//td[text()='Field Name']/parent::tr/descendant::input";
    private String addTaxonomyNodeField = ".//td[text()='Node Type']/parent::tr/descendant::input";
    private String addTaxonomyKeysField = ".//td[text()='Keys']/parent::tr/descendant::input";
    private String taxonomyTable = ".//*[@class='row']";
    private String saveChangesButton = ".//span[text()='Save Changes']";
    private String saveChangesPopupButton = ".//h3[text()='ALERT!!!']/parent::div/descendant::span[text()='Save Changes']";
    private String badgeCount = ".//*[text()='Total Taxonomy Definitions Found']/following-sibling::div/span";
    private String dropDownButton = ".//*[@class='dropdown']/a";

    TaxonomyPage() throws MalformedURLException
    {
        waitForVisible(By.xpath(addTaxonomyButton));
        waitForPageLoadComplete();
        holdOnForACoupleOfSec();
    }

    private void waitForAddTaxonomyFormToDisplay()
    {
        try {
            waitForVisible(By.xpath(addTaxonomyFormCancelButton));
            LOGGER.info("Add Taxonomy Form is displayed");
        } catch (MalformedURLException e) {
            LOGGER.info("Add Taxonomy Form is not displayed");
        }
    }

    public void selectCompany(int namePostFix) throws MalformedURLException
    {
        selectEntity("Company", namePostFix, selectCompanyButton, selectCompanyDropDown);
    }

    public void selectProject(int namePostFix) throws MalformedURLException
    {
        selectEntity("Project", namePostFix, selectProjectButton, selectProjectDropDown);
    }

    public void selectSchema(int namePostFix) throws MalformedURLException
    {
        selectEntity("Schema", namePostFix, selectSchemaButton, selectSchemaDropDown);
    }

    private boolean verifyValuesOnForm(int namePostFix)
    {
        boolean isValueValid = false;
        String companyFieldText = driver.findElement(By.xpath(addTaxonomyCompanyField)).getAttribute("value");
        String projectFieldText = driver.findElement(By.xpath(addTaxonomyProjectField)).getAttribute("value");
        String schemaFieldText = driver.findElement(By.xpath(addTaxonomySchemaField)).getAttribute("value");

        if(companyFieldText.contentEquals("Company" + namePostFix) &&
                projectFieldText.contentEquals("Project" + namePostFix) &&
                schemaFieldText.contentEquals("Schema" + namePostFix))
        {
            isValueValid = true;
        }

        return isValueValid;
    }

    public void addNewTaxonomy(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(addTaxonomyButton));
        waitForAddTaxonomyFormToDisplay();

        if(verifyValuesOnForm(namePostFix)) {
            driver.findElement(By.xpath(addTaxonomyFieldNameField)).sendKeys("Taxonomy" + namePostFix);
            driver.findElement(By.xpath(addTaxonomyNodeField)).sendKeys("Node" + namePostFix);
            driver.findElement(By.xpath(addTaxonomyKeysField)).sendKeys("Keys" + namePostFix);
            clickOnElement(By.xpath(addTaxonomyFormConfirmButton));
            LOGGER.info("Taxonomy is Added");
        }
        else
        {
            LOGGER.info("Invalid Values of Company/Project/Scheme is shown on Form");
        }
    }

    public boolean verifyNewTaxonomyIsAdded(int namePostFix)
    {
        boolean isNewTaxonomyAdded = false;

        if(isElementPresentAndDisplayedByLocator(By.xpath(taxonomyTable)))
        {
            int totalRowsInSchemaTable = driver.findElements(By.xpath(taxonomyTable + "/descendant::tr")).size();
            LOGGER.info(String.valueOf(totalRowsInSchemaTable));
            if(totalRowsInSchemaTable > 1)
            {
                String fieldNameDisplayed, nodeTypeDisplayed, keysDisplayed;
                for (int i = 2; i < totalRowsInSchemaTable + 2; i++)
                {
                    fieldNameDisplayed = driver.findElement(By.xpath(taxonomyTable + "/descendant::tr[" + i + "]/td[3]")).getText();
                    nodeTypeDisplayed = driver.findElement(By.xpath(taxonomyTable + "/descendant::tr[" + i + "]/td[6]")).getText();
                    keysDisplayed = driver.findElement(By.xpath(taxonomyTable + "/descendant::tr[" + i + "]/td[7]")).getText();

                    if (fieldNameDisplayed.contentEquals("Taxonomy" + namePostFix) &&
                            nodeTypeDisplayed.contentEquals("Node" + namePostFix) &&
                            keysDisplayed.contentEquals("Keys" + namePostFix))
                    {
                        String savedToDataBaseDisplayed;
                        savedToDataBaseDisplayed = driver.findElement(By.xpath(taxonomyTable + "/descendant::tr[" + i + "]/td[2]")).getText();

                        if (savedToDataBaseDisplayed.contentEquals("No!!")) {
                            LOGGER.info("Taxonomy Added is Found");
                            isNewTaxonomyAdded = true;
                            break;
                        }
                    }
                }
            }
            else
            {
                LOGGER.info("No Taxonomy on Table is Found");
            }
        }

        return isNewTaxonomyAdded;
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

    public void clickSaveChanges() throws MalformedURLException
    {
        clickOnElement(By.xpath(saveChangesButton));
        holdOnForACoupleOfSec();
        waitForVisible(By.xpath(saveChangesPopupButton));
        clickOnElement(By.xpath(saveChangesPopupButton));
        holdOnForACoupleOfSec();
    }

    public boolean verifySaveChanges(int namePostFix)
    {
        boolean isNewTaxonomySaved = false;

        if(isElementPresentAndDisplayedByLocator(By.xpath(taxonomyTable)))
        {
            int totalRowsInSchemaTable = driver.findElements(By.xpath(taxonomyTable + "/descendant::tr")).size();
            LOGGER.info(String.valueOf(totalRowsInSchemaTable));
            if(totalRowsInSchemaTable > 1)
            {
                String fieldNameDisplayed, nodeTypeDisplayed, keysDisplayed;
                for (int i = 2; i < totalRowsInSchemaTable + 2; i++)
                {
                    fieldNameDisplayed = driver.findElement(By.xpath(taxonomyTable + "/descendant::tr[" + i + "]/td[3]")).getText();
                    nodeTypeDisplayed = driver.findElement(By.xpath(taxonomyTable + "/descendant::tr[" + i + "]/td[6]")).getText();
                    keysDisplayed = driver.findElement(By.xpath(taxonomyTable + "/descendant::tr[" + i + "]/td[7]")).getText();

                    if (fieldNameDisplayed.contentEquals("Taxonomy" + namePostFix) &&
                            nodeTypeDisplayed.contentEquals("Node" + namePostFix) &&
                            keysDisplayed.contentEquals("Keys" + namePostFix))
                    {
                        String savedToDataBaseDisplayed;
                        savedToDataBaseDisplayed = driver.findElement(By.xpath(taxonomyTable + "/descendant::tr[" + i + "]/td[2]")).getText();

                        if (savedToDataBaseDisplayed.contentEquals("Yes")) {
                            LOGGER.info("Taxonomy Added is Found");
                            isNewTaxonomySaved = true;
                            break;
                        }
                    }
                }
            }
            else
            {
                LOGGER.info("No Taxonomy on Table is Found");
            }
        }

        return isNewTaxonomySaved;
    }
}
