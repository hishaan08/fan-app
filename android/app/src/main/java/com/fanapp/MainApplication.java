import com.fanapp.BluetoothAdapter;

public class MainApplication extends Application implements ReactApplication {
  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      @SuppressWarnings("UnnecessaryLocalVariable")
      List<ReactPackage> packages = new PackageList(this).getPackages();
      // Add the BluetoothAdapter package
      packages.add(new ReactPackage() {
        @Override
        public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
          List<NativeModule> modules = new ArrayList<>();
          modules.add(new BluetoothAdapter(reactContext));
          return modules;
        }

        @Override
        public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
          return Collections.emptyList();
        }
      });
      return packages;
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
} 