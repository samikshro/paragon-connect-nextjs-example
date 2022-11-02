import App from "next/app";
import jsonwebtoken from 'jsonwebtoken';
import { useEffect } from 'react';
import "todomvc-common/base.css";
import "todomvc-app-css/index.css";
import "../styles/globals.css";

function MyApp({ Component, pageProps, user, token }) {
  // Pass the Paragon User Token as a prop to each page, from the authenticated
  // user object, if available
  useEffect(() => {
    if (token) {
      paragon.authenticate(process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID, token);
    }
  }, [token]);

  return (
    <Component
      paragonUserToken={user?.paragonUserToken}
      user={user}
      {...pageProps}
    />
  );
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  if (!appContext.ctx.req) {
    return appProps;
  }

  const authenticatedUser = appContext.ctx.req?.user;
  const createdAt = Math.floor(Date.now() / 1000)
  if (authenticatedUser) {
    return {
      ...appProps,
      user: authenticatedUser,
      token: jsonwebtoken.sign({
        sub: authenticatedUser?.id,
        iat: createdAt,
        exp: createdAt + 60 * 60
      }, process.env.PARAGON_SIGNING_KEY, { algorithm : "RS256"})
    };
  }
  return appProps;
};

export default MyApp;
