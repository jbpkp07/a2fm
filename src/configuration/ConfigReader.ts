import FileSystemUtils from "../common/FileSystemUtils";
import ValidationUtils from "../common/ValidationUtils";

const { existsSync, readFileSyncJSON, sanitize } = FileSystemUtils;
const { isNullableString, isObject, isObjectArray, isString, isStringArray } = ValidationUtils;

type SrcRootDirPath = string;
type DestRootDirPath = string;
type Entry = [SrcRootDirPath, DestRootDirPath];

interface RootDirPaths {
    readonly src: string;
    readonly dest: string | null;
}

interface MigrationRoutes {
    readonly destDefault: string;
    readonly rootDirPaths: RootDirPaths[];
}

interface FileConfig {
    readonly migrationRoutes: MigrationRoutes;
    readonly excludedDirs: string[];
    readonly excludedFiles: string[];
    readonly progressMetadataExts: string[];
}

interface AppConfig {
    readonly excludedDirs: string[];
    readonly excludedFiles: string[];
    readonly progressMetadataExts: string[];
    readonly srcDestRootDirPaths: Map<SrcRootDirPath, DestRootDirPath>;
}

class ConfigReader {
    private constructor() {}

    private static hasUniqueSrcRootDirPaths = (rootDirPaths: RootDirPaths[]): boolean => {
        const toSrcRootDirPath = ({ src }: RootDirPaths) => sanitize(src).toLowerCase();

        const srcRootDirPaths = rootDirPaths.map(toSrcRootDirPath);
        const uniqueSrcRootDirPaths = new Set<string>(srcRootDirPaths);

        return srcRootDirPaths.length === uniqueSrcRootDirPaths.size;
    };

    private static isRootDirPathObject = (obj: RootDirPaths) => {
        const { length } = Object.keys(obj);

        return length === 2 && isString(obj.src) && isNullableString(obj.dest);
    };

    private static toAppConfig = (config: FileConfig): AppConfig => {
        const { excludedDirs, excludedFiles, migrationRoutes, progressMetadataExts } = config;
        const { destDefault, rootDirPaths } = migrationRoutes;

        const toTrimmed = (str: string) => str.trim();
        const toExt = (ext: string) => (ext.startsWith(".") ? ext : "." + ext);
        const toEntry = ({ src, dest }: RootDirPaths): Entry => [sanitize(src), sanitize(dest || destDefault)];

        const entries = rootDirPaths.map(toEntry);

        return {
            excludedDirs: excludedDirs.map(toTrimmed),
            excludedFiles: excludedFiles.map(toTrimmed),
            progressMetadataExts: progressMetadataExts.map(toTrimmed).map(toExt),
            srcDestRootDirPaths: new Map<SrcRootDirPath, DestRootDirPath>(entries)
        };
    };

    private static validateConfig = (config: FileConfig): void => {
        if (!isObject(config)) {
            throw new Error("[config.json] config is not an object");
        }

        this.validateMigrationRoutes(config.migrationRoutes);

        if (!isStringArray(config.excludedDirs)) {
            throw new Error("[config.json] config.excludedDirs is not a string array");
        }

        if (!isStringArray(config.excludedFiles)) {
            throw new Error("[config.json] config.excludedFiles is not a string array");
        }

        if (!isStringArray(config.progressMetadataExts)) {
            throw new Error("[config.json] config.progressMetadataExts is not a string array");
        }
    };

    private static validateMigrationRoutes = (migrationRoutes: MigrationRoutes): void => {
        const { hasUniqueSrcRootDirPaths, isRootDirPathObject } = this;

        if (!isObject(migrationRoutes)) {
            throw new Error("[config.json] config.migrationRoutes is not an object");
        }

        if (!isString(migrationRoutes.destDefault)) {
            throw new Error("[config.json] config.migrationRoutes.destDefault is not a string");
        }

        if (!isObjectArray(migrationRoutes.rootDirPaths)) {
            throw new Error("[config.json] config.migrationRoutes.rootDirPaths is not an object array");
        }

        if (!migrationRoutes.rootDirPaths.every(isRootDirPathObject)) {
            throw new Error(
                "[config.json] config.migrationRoutes.rootDirPaths is not an array of: { src: string; dest: string | null }"
            );
        }

        if (!hasUniqueSrcRootDirPaths(migrationRoutes.rootDirPaths)) {
            throw new Error("[config.json] config.migrationRoutes.rootDirPaths has duplicate src paths");
        }

        this.validateSrcDirRootPathsExist(migrationRoutes.rootDirPaths);
    };

    private static validateSrcDirRootPathsExist = (rootDirPaths: RootDirPaths[]): void => {
        const toSrcRootDirPath = ({ src }: RootDirPaths) => sanitize(src);

        const srcRootDirPaths = rootDirPaths.map(toSrcRootDirPath);

        for (const srcRootDirPath of srcRootDirPaths) {
            if (!existsSync(srcRootDirPath)) {
                throw new Error(
                    `[config.json] config.migrationRoutes.rootDirPaths src path does not exist ${srcRootDirPath}`
                );
            }
        }
    };

    public static readConfig = (configPath: string): AppConfig => {
        const fileConfig = readFileSyncJSON<FileConfig>(configPath);

        this.validateConfig(fileConfig);

        return this.toAppConfig(fileConfig);
    };
}

export default ConfigReader;
