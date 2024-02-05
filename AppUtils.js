const bcrypt=require('bcrypt');
module.exports = class AppUtils {
    static generateMissingFieldError(fieldName) {
        return {
            error: "Field Missing",
            message: `${fieldName} is missing`,
        };
    }
    static generateError(type, message) {
        return {
            error: type,
            message: message,
        };
    }

    static generateSuccess(type, message) {
        return {
            status: type,
            message: message,
        };
    }

    static checkError(obj, objClass) {
        if (!obj) {
            return AppUtils.generateMissingFieldError("Request Body");
        }

        console.log(obj);
        for (let keyName of Object.keys(objClass)) {
            if (!obj[objClass[keyName]]) {
                return AppUtils.generateMissingFieldError(objClass[keyName].toString());
            }
        }
        return null;
    }

    static async encryptPassword(password) {
        const saltRounds = 10;
        let result;
        await bcrypt
            .hash(password, saltRounds)
            .then((hash) => {
                result = hash;
            })
            .catch((err) => console.error(err.message));
        return result;
    }
}