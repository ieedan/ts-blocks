import path from "node:path";
import { Project } from "ts-morph";

const findDependencies = (filePath: string, category: string, isSubDir: boolean, project: Project | undefined = undefined): string[] => {
    let prj = project;
    if (!prj) {
        prj = new Project();
    }

    const blockFile = prj.addSourceFileAtPath(filePath);

    const imports = blockFile.getImportDeclarations();

    const relativeImports = imports.filter((declaration) =>
        declaration.getModuleSpecifierValue().startsWith(".")
    );

    const localDeps: string[] = [];

    const removeExtension = (p: string) => {
        const index = p.lastIndexOf(".");

        if (index === -1) return p;

        return p.slice(0, index + 1);
    };

    // Attempts to resolve local dependencies
    // Can only resolve dependencies that are within the blocks folder so `./` or `../` paths.

    for (const relativeImport of relativeImports) {
        const mod = relativeImport.getModuleSpecifierValue();

        if (!isSubDir && mod.startsWith("./")) {
            localDeps.push(`${category}/${removeExtension(path.basename(mod))}`);
            continue;
        }

        if (isSubDir && mod.startsWith("../") && !mod.startsWith("../.")) {
            localDeps.push(`${category}/${removeExtension(path.basename(mod))}`);
            continue;
        }

        const segments = mod.replaceAll("../", "").split("/");

        // invalid path
        if (segments.length !== 2) continue;

        localDeps.push(`${segments[0]}/${segments[1]}`);
    }

    return localDeps;
};

export { findDependencies }