import Link from "next/link";

import { Button } from "@/components/ui/button";
import { config } from "@/configs/application";

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto px-8 py-16 sm:py-12 md:py-16 max-w-5xl">
      <section className="text-left mb-6 sm:mb-8 relative">
        <Link href="/" passHref>
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-12 sm:-top-16 left-0 rounded-full bg-secondary hover:bg-secondary/80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight md:max-w-4xl">
          Privacy Policy for {config.projectName}
        </h1>
        <p className="text-lg sm:text-xl mb-8 sm:mb-10 md:mb-12 text-muted-foreground">
          We are committed to protecting your privacy and ensuring the security
          of your data. This policy outlines our practices regarding the{" "}
          {config.projectName} extension.
        </p>
      </section>

      <section className="mb-8 p-2 sm:p-4 border border-border rounded-lg bg-secondary/50">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8">
          <div className="bg-secondary/10 p-4 sm:p-6 md:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
              1. Information Collection and Use
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              The {config.projectName} extension is designed with a
              privacy-first approach. We do not collect, store, or transmit any
              personal information. All theme customizations are performed
              locally within your browser, ensuring that your data remains under
              your control at all times.
            </p>
          </div>

          <div className="bg-secondary/10 p-4 sm:p-6 md:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
              2. Data Storage
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Any theme customizations you create are stored locally in your
              browser using Chrome&apos;s storage API. This data is accessible
              only to you and is not shared with us or any third parties. The
              security of your customizations is dependent on your local browser
              security settings.
            </p>
          </div>

          <div className="bg-secondary/10 p-4 sm:p-6 md:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
              3. Third-Party Services
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Our extension operates independently and does not integrate with
              any third-party services. This means that no external entities
              have access to your data or customizations, further protecting
              your privacy.
            </p>
          </div>

          <div className="bg-secondary/10 p-4 sm:p-6 md:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
              4. Security Measures
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              We have implemented reasonable technical and organizational
              measures to protect the integrity of our extension. However, as
              the extension operates locally, we recommend keeping your browser
              and operating system up-to-date to maintain optimal security for
              your customizations.
            </p>
          </div>

          <div className="bg-secondary/10 p-4 sm:p-6 md:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
              5. Updates to Privacy Policy
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              We may update this privacy policy from time to time to reflect
              changes in our practices or for other operational, legal, or
              regulatory reasons. We will notify you of any material changes by
              posting the new privacy policy on this page and updating the
              &quot;Last updated&quot; date at the top of this policy.
            </p>
          </div>

          <div className="bg-secondary/10 p-4 sm:p-6 md:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
              6. Your Rights and Choices
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              As we do not collect any personal data, there is no need for data
              access, correction, or deletion requests. You have full control
              over your theme customizations within the extension.
            </p>
          </div>

          <div className="bg-secondary/10 p-4 sm:p-6 md:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
              7. Compliance with Laws
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              While we do not collect personal data, we are committed to
              complying with applicable data protection laws and regulations,
              including GDPR and CCPA, to the extent they apply to our
              operations.
            </p>
          </div>

          <div className="bg-secondary/10 p-6 sm:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              9. Contact Information
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-4">
              If you have any questions about these Privacy Policy, please
              contact us:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-200 p-4 rounded-lg flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 mb-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a
                  href="mailto:felipebarcelospro@gmail.com"
                  className="text-base font-semibold text-center"
                >
                  felipebarcelospro@gmail.com
                </a>
              </div>
              <div className="bg-gray-200 p-4 rounded-lg flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 mb-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <a
                  href="https://github.com/felipebarcelospro/drift"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-semibold text-center"
                >
                  GitHub Repository
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center mt-8">
        <Button size="lg" className="w-full sm:w-auto" asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </main>
  );
}
