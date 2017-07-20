import _ from 'lodash'
import utils from 'utils'
export default (req,res,next) => {
    const configData = $config().session;
    const cookiePrefix = configData.cookiePrefix;
    let sessionData = parseSession();

    const options = {
        domain: configData.cookieDomain,
        path: configData.path,
        maxAge: new Date(Date.now() + configData.maxAge),
        httpOnly: configData.httpOnly
    }

    const deleteOptions = {
        domain: configData.cookieDomain,
        path: configData.path,
        httpOnly: configData.httpOnly
    }

    res.session = session;
    res.clearSession = clearSession;
    res.destroySessions = destroySessions;

    next();

    function parseSession() {
        let rVal = {};
        _.forEach(req.cookies, (value,key) => {
            const sessionPrefix = new RegExp('^' + cookiePrefix);
            const isSessionCookie = key.search(sessionPrefix) !== -1;

            if (isSessionCookie) {
                key = key.replace(sessionPrefix,'');

                if (utils.isJson(value)){
                    value = JSON.parse(value);
                }

                rVal[key] = value;
            }
        });
        return rVal;
    }

    function session(key,value) {
        if (!key && utils.Type.isUndefined(value)){
            return sessionData;
        }

        if (!value){
            return sessionData[key];
        }

        sessionData[key] = value;

        const cookieKey = cookiePrefix + key;
        const cookieValue = utils.Type.isString(value) ? value : utils.Object.stringify(value);

        return res.cookie(cookieKey,cookieValue,options);
    }

    function clearSession(keys) {
        let cookieKey;
        const key = keys;

        if (utils.Type.isArray(keys)){
            _.forEach(keys,(key) => {
                delete sessionData[key];

                cookieKey = `${cookiePrefix}${key}`;
                res.clearCookie(cookieKey,deleteOptions);
            });
        } else {
            delete sessionData[key];

            cookieKey = `${cookiePrefix}${key}`;
            res.clearCookie(cookieKey, deleteOptions);
        }
    }

    function destroySessions() {
        let cookieKey;
        if (sessionData){
            _.forEach(sessionData, (value,key) => {
                delete sessionData[key];
                cookieKey = `${cookiePrefix}${key}`;
                res.clearCookie(cookieKey,deleteOptions);
            })
        } else {
            return;
        }
    }
}