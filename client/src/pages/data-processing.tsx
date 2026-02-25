import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Shield, Users, Settings, Lock, Eye } from "lucide-react";

export default function DataProcessing() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Database className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Data Processing Agreement</h1>
        </div>
        <p className="text-gray-600">
          Last updated: July 09, 2025
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Data Processing Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            This Data Processing Agreement ("DPA") governs how Red2Blue processes your personal data in accordance with GDPR, CCPA, and other applicable privacy regulations.
          </p>
          <p className="text-gray-700">
            As a mental performance coaching platform, we process your data solely to provide personalized AI coaching, track your progress, and enhance your mental game performance.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-semibold">
              Data Controller: Cero International (Red2Blue Division)
            </p>
            <p className="text-sm text-blue-700 mt-2">
              We act as the data controller for all personal information you provide through the Red2Blue platform.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Types of Data We Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Personal Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>Name, email address, and contact details</li>
                <li>Golf handicap and performance metrics</li>
                <li>Subscription tier and payment information</li>
                <li>Account preferences and settings</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Mental Performance Data</h4>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>Mental Skills X-Check assessment results</li>
                <li>Daily mood tracking scores</li>
                <li>AI coaching conversation history</li>
                <li>Technique practice logs and progress</li>
                <li>Stress level indicators and patterns</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Usage Analytics</h4>
            <div className="bg-green-50 p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>Platform engagement metrics</li>
                <li>Feature usage patterns</li>
                <li>Session duration and frequency</li>
                <li>Performance improvement trends</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Legal Basis for Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">Contract Performance</h5>
              <p className="text-sm text-gray-600">
                Processing necessary to provide AI coaching services and platform functionality as outlined in your subscription agreement.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">Legitimate Interest</h5>
              <p className="text-sm text-gray-600">
                Improving our AI coaching algorithms and platform features to enhance mental performance outcomes.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">Consent</h5>
              <p className="text-sm text-gray-600">
                Optional features like advanced analytics and community participation require explicit user consent.
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">Legal Obligation</h5>
              <p className="text-sm text-gray-600">
                Payment processing, tax compliance, and regulatory requirements as applicable to our services.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Data Security Measures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">Encryption</h5>
              <p className="text-sm text-gray-600">
                All data is encrypted in transit (TLS 1.3) and at rest (AES-256) using industry-standard protocols.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">Access Controls</h5>
              <p className="text-sm text-gray-600">
                Role-based access with multi-factor authentication. Only authorized personnel can access personal data.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">Data Minimization</h5>
              <p className="text-sm text-gray-600">
                We collect only the data necessary for mental performance coaching and delete data when no longer needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Third-Party Data Sharing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            We share data with trusted third parties only as necessary to provide our services:
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-1">Google AI Services</h5>
              <p className="text-sm text-gray-600">
                Anonymized conversation data for AI coaching responses (no personal identifiers)
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-1">Stripe Payment Processing</h5>
              <p className="text-sm text-gray-600">
                Payment information for subscription processing (encrypted and tokenized)
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-1">Neon Database Hosting</h5>
              <p className="text-sm text-gray-600">
                Encrypted data storage with enterprise-grade security and compliance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Your Data Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Under GDPR and other privacy laws, you have the following rights:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">Access & Portability</h5>
              <p className="text-sm text-gray-600">
                Request a copy of your data in a machine-readable format
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">Rectification</h5>
              <p className="text-sm text-gray-600">
                Correct inaccurate or incomplete personal information
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">Erasure</h5>
              <p className="text-sm text-gray-600">
                Request deletion of your personal data (right to be forgotten)
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">Restriction</h5>
              <p className="text-sm text-gray-600">
                Limit how we process your data in certain circumstances
              </p>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Exercise Your Rights:</strong> Contact <a href="mailto:privacy@red2blue.me" className="text-blue-600 hover:underline">privacy@red2blue.me</a> to request any of these actions. We will respond within 30 days.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            We retain your data only as long as necessary to provide our services and comply with legal obligations:
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Active subscription data</span>
              <span className="text-sm text-gray-600">Duration of subscription + 1 year</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Assessment and coaching history</span>
              <span className="text-sm text-gray-600">5 years or until deletion request</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Payment and billing records</span>
              <span className="text-sm text-gray-600">7 years (legal requirement)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Anonymized usage analytics</span>
              <span className="text-sm text-gray-600">Indefinitely (non-personal)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            For data processing inquiries, privacy concerns, or to exercise your data rights:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Data Protection Officer:</strong> privacy@red2blue.me<br />
              <strong>Business Address:</strong> Cero International, Dubai, UAE<br />
              <strong>Response Time:</strong> Within 30 days (as required by GDPR)<br />
              <strong>Escalation:</strong> If unsatisfied with our response, you may contact your local data protection authority
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}