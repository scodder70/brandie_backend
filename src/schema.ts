import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import path from 'path';

// Load all .graphql files from all modules
const typesArray = loadFilesSync(path.join(__dirname, 'modules/**/*.graphql'));

// Merge them into a single schema string
export const typeDefs = mergeTypeDefs(typesArray);