import {Route, Redirect} from "react-router-dom"
import React, {useContext} from "react"
import AuthContext from "../context/AuthContext"


const PrivateRoute = ({component: Component, ...rest}) => {
    let {user} = useContext(AuthContext)
    return <Route {...rest}>{!user ? <Redirect to="/login-p" /> : <Component/>}</Route>
}

export default PrivateRoute