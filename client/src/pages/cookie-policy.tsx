import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, Shield, Settings, Info } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Cookie className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
        </div>
        <p className="text-gray-600">
          Last updated: July 09, 2025
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            What Are Cookies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and enabling essential website functionality.
          </p>
          <p className="text-gray-700">
            Red2Blue uses cookies to enhance your mental performance coaching experience, maintain your session security, and provide personalized AI coaching recommendations.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Types of Cookies We Use
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Essential Cookies</h4>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                These cookies are necessary for the website to function properly and cannot be disabled.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>Session authentication cookies</li>
                <li>Security tokens for payment processing</li>
                <li>User preference storage</li>
                <li>Essential website functionality</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Performance Cookies</h4>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                These cookies help us understand how you use our platform to improve your experience.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>Analytics and usage tracking</li>
                <li>Feature engagement metrics</li>
                <li>Performance monitoring</li>
                <li>Error tracking and debugging</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Functional Cookies</h4>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                These cookies enable enhanced functionality and personalization features.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>AI coaching personalization</li>
                <li>Assessment progress tracking</li>
                <li>Technique recommendations</li>
                <li>Dashboard customization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Managing Your Cookie Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Browser Settings</h4>
            <p className="text-gray-700 mb-3">
              You can control cookies through your browser settings. However, disabling essential cookies may affect the functionality of the Red2Blue platform.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Browser cookie management:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Chrome: Settings → Privacy and security → Cookies</li>
                <li>Firefox: Settings → Privacy & Security → Cookies</li>
                <li>Safari: Preferences → Privacy → Manage Website Data</li>
                <li>Edge: Settings → Cookies and site permissions</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Account Settings</h4>
            <p className="text-gray-700">
              Premium and Ultimate subscribers can manage their data preferences in their account settings, including coaching personalization and analytics participation.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Third-Party Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Red2Blue integrates with trusted third-party services that may use their own cookies:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">Stripe Payment Processing</h5>
              <p className="text-sm text-gray-600">
                Secure payment processing and subscription management cookies.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">Google AI Services</h5>
              <p className="text-sm text-gray-600">
                AI coaching functionality and natural language processing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            All cookie data is encrypted and stored securely. We never share personal information from cookies with unauthorized third parties.
          </p>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Your mental performance data and AI coaching conversations are never stored in cookies. This sensitive information is securely stored in our encrypted database with your explicit consent.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            If you have questions about our cookie policy or want to exercise your privacy rights, please contact us:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Email: <a href="mailto:privacy@red2blue.me" className="text-blue-600 hover:underline">privacy@red2blue.me</a><br />
              Subject: Cookie Policy Inquiry<br />
              Response time: Within 48 hours
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}