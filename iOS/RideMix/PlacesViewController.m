//
//  PlacesViewController.m
//  RideMix
//
//  Created by Alejandro Rodriguez on 3/22/13.
//  Copyright (c) 2013 Alejandro Rodriguez. All rights reserved.
//

#import "PlacesViewController.h"

@interface PlacesViewController () <CLLocationManagerDelegate, UITableViewDataSource, UITableViewDelegate>

@property (strong, nonatomic) CLLocationManager *locationManager;
@property (strong, nonatomic) CLLocation *location;
@property (strong, nonatomic) NSArray *googlePlaces;

@end

@implementation PlacesViewController

#pragma mark - CLLocationManagerDelegate

- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray *)locations
{
    CLLocation *newLocation = [locations lastObject];
    self.location = newLocation;
}

# pragma mark - UITableViewDataSource

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return [self.googlePlaces count];
}

- (NSString *)titleForRow:(NSUInteger)row
{
    return [((NSDictionary *)self.googlePlaces[row]) valueForKey:@"name"];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"Place";
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier forIndexPath:indexPath];
    
    // Configure the cell...
    cell.textLabel.text = [self titleForRow:indexPath.row];
    
    return cell;
}

- (void)setLocation:(CLLocation *)location
{
    _location = location;
    NSString *googleQuery = [NSString stringWithFormat:@"http://ridemix.com/get/places?location=%f,%f&types=restaurant", location.coordinate.latitude, location.coordinate.longitude];
    NSData *jsonData = [[NSString stringWithContentsOfURL:[NSURL URLWithString:googleQuery] encoding:NSUTF8StringEncoding error:nil] dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error = nil;
    NSDictionary *googleResults = jsonData ? [NSJSONSerialization JSONObjectWithData:jsonData options:NSJSONReadingMutableContainers|NSJSONReadingMutableLeaves error:&error] : nil;
    self.googlePlaces = [[googleResults objectForKey:@"results"] allObjects];
}

- (void)setGooglePlaces:(NSArray *)googlePlaces
{
    _googlePlaces = googlePlaces;
    [self.tableView reloadData];
}

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view.
    self.locationManager = [[CLLocationManager alloc] init];
    self.locationManager.delegate        = self;
    self.locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters;
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [self.locationManager startUpdatingLocation];
}

- (void)viewDidDisappear:(BOOL)animated
{
    [self.locationManager stopUpdatingLocation];
    [super viewDidDisappear:animated];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
