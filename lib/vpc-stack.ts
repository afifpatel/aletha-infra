import { Stack, StackProps, aws_ec2 as ec2 } from "aws-cdk-lib";
import { Parameters } from "../helpers";
import { Construct } from "constructs";

const POSTGRES_PORT = 5432;

interface VpcStackProps extends StackProps {
}

export class VpcStack extends Stack {
    public vpc: ec2.Vpc;

    constructor(scope: Construct, id: string, props: VpcStackProps) {
        super(scope, id, props);

        this.vpc = this.createVpc();
        const lambdaSecurityGroup = this.createLambdaSecurityGroup();
        const rdsSecurityGroup = this.createRdsSecurityGroup();

        rdsSecurityGroup.addIngressRule(
            ec2.Peer.securityGroupId(lambdaSecurityGroup.securityGroupId),
            ec2.Port.tcp(POSTGRES_PORT),
            'Allow access for Lambda'
        );

        const ssm = new Parameters(this);
        ssm.rdsSecurityGroupId = rdsSecurityGroup.securityGroupId;
        ssm.lambdaSecurityGroupId = lambdaSecurityGroup.securityGroupId;
    }

    private createVpc(): ec2.Vpc {
        const vpc = new ec2.Vpc(this, 'customVPC', {
            vpcName: 'custom',
            maxAzs: 2,
            natGateways: 2,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'Public',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'Private',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },
                {
                    cidrMask: 24,
                    name: 'Isolated',
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },
            ],
        });

        return vpc;
    }

    createLambdaSecurityGroup() {
        const sg = new ec2.SecurityGroup(this, 'lambdaSecurityGroup', {
            securityGroupName: 'lambda',
            vpc: this.vpc,
            allowAllOutbound: true,
        });
        return sg;
    }

    createRdsSecurityGroup() {
        const sg = new ec2.SecurityGroup(this, 'rdsSecurityGroup', {
            securityGroupName: 'rds',
            vpc: this.vpc,
            allowAllOutbound: true,
        });

        // Allow all TCP traffic in
        sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.allTcp(), 'All TCP Ports');
        return sg;
    }
}