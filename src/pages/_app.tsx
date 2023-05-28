import { type AppType } from 'next/app'

import { ToastContainer } from 'react-toastify'

import { api } from '~/utils/api'

import '~/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
    </>
  )
}

export default api.withTRPC(MyApp)
