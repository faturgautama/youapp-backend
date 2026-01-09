import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true, unique: true, trim: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook to hash password
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
    candidatePassword: string,
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Exclude password from JSON response
UserSchema.set('toJSON', {
    transform: function (doc, ret) {
        const { password, ...rest } = ret;
        return rest;
    },
});
