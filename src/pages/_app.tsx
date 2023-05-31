import { type AppType } from 'next/app'

import { ToastContainer } from 'react-toastify'

import { api } from '~/utils/api'

import 'react-toastify/dist/ReactToastify.css'
import '~/styles/globals.css'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
      <ToastContainer />
    </>
  )
}

export default api.withTRPC(MyApp)
