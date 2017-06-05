package pagesIngestionInterface;

import org.openqa.selenium.By;

import java.net.MalformedURLException;

import setup.WebAppPage;

/**
 * Created by az on 6/5/17.
 */

public class UploadPage extends WebAppPage
{
    private String dropZone = ".//div[@class='dropzone']";

    UploadPage() throws MalformedURLException
    {
        waitForVisible(By.xpath(dropZone));
        waitForPageLoadComplete();
        holdOnForACoupleOfSec();
    }
}
