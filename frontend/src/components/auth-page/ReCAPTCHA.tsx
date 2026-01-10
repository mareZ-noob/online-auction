import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import env from "@/config/env";

const SITE_KEY = env.RECAPTCHA_SITE_KEY;

type MyReCAPTCHAProps = {
	captchaRef: React.RefObject<ReCAPTCHA | null>;
};

export default function MyReCAPTCHA({ captchaRef }: MyReCAPTCHAProps) {
	return (
		<div>
			<ReCAPTCHA sitekey={SITE_KEY} ref={captchaRef} />
		</div>
	);
}
