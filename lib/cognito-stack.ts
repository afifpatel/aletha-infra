import { Stack, StackProps, aws_cognito as cognito } from "aws-cdk-lib";
import { Parameters } from "../helpers";
import { Construct } from "constructs";

export class CognitoStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const userPool = this.createUserPool();
        const userPoolWebClient = this.createUserPoolWebClient(userPool);

        const ssm = new Parameters(this);
        ssm.cognitoUserPoolId = userPool.userPoolId;
        ssm.cognitoClientId = userPoolWebClient.userPoolClientId;
    }

    createUserPool() {
        const userPool = new cognito.UserPool(this, 'UsersPool', {
            userPoolName: 'users',
            selfSignUpEnabled: true,
            signInCaseSensitive: false,
            signInAliases: {
                username: true,
                email: true
            },
            autoVerify: {
                email: true
            }
        });

        return userPool;
    }

    createUserPoolWebClient(userPool: cognito.UserPool) {
        const client = userPool.addClient('cognitoWebClient', {
            userPoolClientName: 'web-client',
            authFlows: {
                userPassword: true,
                userSrp: true
            },
            writeAttributes: new cognito.ClientAttributes().withStandardAttributes({
                givenName: true,
                familyName: true
            })
        });

        return client;
    }
}