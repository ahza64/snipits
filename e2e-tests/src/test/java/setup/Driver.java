package setup;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;
import java.util.Properties;

public class Driver
{
    public static Properties prop;
    private static WebDriver driverMP;

    public static WebDriver startChromeBrowser()
    {
        getPropertiesFromFile();
        System.setProperty("webdriver.chrome.driver", "src/test/resources/drivers/chromedriver");
        driverMP = new ChromeDriver();
        driverMP.manage().window().maximize();
        driverMP.manage().window().setPosition(new Point(0,0));
        java.awt.Dimension screenSize = java.awt.Toolkit.getDefaultToolkit().getScreenSize();
        Dimension dim = new Dimension((int) screenSize.getWidth(), (int) screenSize.getHeight());
        driverMP.manage().window().setSize(dim);
        return driverMP;
    }

    public static Properties getPropertiesFromFile() {
        File file = new File("src/test/resources/dataFile.properties");

        FileInputStream fileInput = null;
        try
        {
            fileInput = new FileInputStream(file);
        } catch (FileNotFoundException e)
        {
            e.printStackTrace();
        }
        prop = new Properties();

        //load properties file
        try
        {
            prop.load(fileInput);
        } catch (IOException e)
        {
            e.printStackTrace();
        }
        return prop;
    }

    public static String getAdminUserName()
    {
        return prop.getProperty("adminUsername");
    }

    public static String getAdminPassword()
    {
        return prop.getProperty("adminPassword");
    }

    public static String getIngestionInterfaceUsername()
    {
        return prop.getProperty("ingestionInterfaceUsername");
    }

    public static String getingestionInterfacePassword()
    {
        return prop.getProperty("ingestionInterfacePassword");
    }

    public static String getInternalAdminAppURLAppURL()
    {
        return prop.getProperty("internalAdminAppURL");
    }

    public static String getIngestionInterfaceAppURL()
    {
        return prop.getProperty("ingestionInterfaceAppURL");
    }

    public static String getIPAddress() {
        String ipAddress = null;
        Enumeration<NetworkInterface> ifaces = null;
        try {
            ifaces = NetworkInterface.getNetworkInterfaces();

            while (ifaces.hasMoreElements()) {
                NetworkInterface iface = ifaces.nextElement();
                Enumeration<InetAddress> addresses = iface.getInetAddresses();

                while (addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    if (addr instanceof Inet4Address && !addr.isLoopbackAddress()) {
                        ipAddress = String.valueOf(addr);
                    }
                }
            }
        } catch (SocketException e) {
            e.printStackTrace();
        }
        return ipAddress;
    }

    private String parseResponseSessionForTestdroid(InputStream inputStream) throws IOException {

        String sessionID = null;
        try {
            String line;
            JSONObject a;
            JSONParser parser = new JSONParser();
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));

            while ((line = bufferedReader.readLine()) != null) {
                a = (JSONObject) parser.parse(line);
                sessionID = a.get("sessionId").toString();
            }

        } catch (ParseException e) {
            e.printStackTrace();
        }
        return sessionID;
    }
}
