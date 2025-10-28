import mongoose, { Model } from 'mongoose';
import appealSchema from './schema/appeal.schema';
import { DatabaseAppeal } from '../types/types';

/**
 * Mongoose model for the `Appeal` collection.
 *
 * This model is created using the `Appeal` interface and the `appealSchema`, representing the
 * `Appeal` collection in the MongoDB database, and provides an interface for interacting with
 * the stored appeals.
 *
 * @type {Model<DatabaseAppeal>}
 */
const AppealModel: Model<DatabaseAppeal> = mongoose.model<DatabaseAppeal>('Appeal', appealSchema);

export default AppealModel;
