import shutil
import os
import platform

# Creates an example React or Angular or a bundled JS example (or all)
# Depends on the content of React and Angular and Symbolication folders respectively

def setup_react_example():
    print("Creating React example...")
    os.system("npx create-react-app react-example")
    
    # Remove existing src folder
    if os.path.exists("react-example/src"):
        shutil.rmtree("react-example/src")

    # Copy contents of React folder over to React example
    shutil.copytree("React", "react-example", dirs_exist_ok=True)

    os.chdir("react-example")
    # Add countly-sdk-web to dependencies in package.json
    os.system("npm install --save countly-sdk-web@latest react-router-dom@5.3.3")
    os.chdir("..")

def setup_angular_example():
    print("Creating Angular example...")
    os.system("npx @angular/cli@next new angular-example --defaults")

    # Copy contents of Angular folder over to Angular example
    shutil.copytree("Angular", "angular-example/src", dirs_exist_ok=True)

    os.chdir("angular-example")
    # Add countly-sdk-web to dependencies in package.json
    os.system("npm install --save countly-sdk-web@latest")
    os.chdir("..")
    
def setup_symbolication_example():
    print("Creating Symbolication example...")
    os.system('npx degit "rollup/rollup-starter-app" symbolication-example')

    # Copy contents of Symbolication folder over to Symbolication example
    shutil.copytree("Symbolication/public", "symbolication-example/public", dirs_exist_ok=True)
    shutil.copytree("Symbolication/src", "symbolication-example/src", dirs_exist_ok=True)

    os.chdir("symbolication-example")
    # Add countly-sdk-web to dependencies in package.json
    os.system("npm install --save countly-sdk-web@latest")
    os.chdir("..")

if __name__ == "__main__":
    example = input('Select an example to create (react/angular/symbolication/all): ')
    if example == "react":
        setup_react_example()
    elif example == "angular":
        setup_angular_example()
    elif example == "symbolication":
        setup_symbolication_example()
    elif example == "all":
        setup_react_example()
        setup_angular_example()
        setup_symbolication_example()
    else:
        print("Invalid input. Exiting...")
        exit(1)
