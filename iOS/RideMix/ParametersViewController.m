//
//  ParametersViewController.m
//  RideMix
//
//  Created by Alejandro Rodriguez on 4/15/13.
//  Copyright (c) 2013 Alejandro Rodriguez. All rights reserved.
//

#import "ParametersViewController.h"

@interface ParametersViewController ()

@property (nonatomic) int numUsers;
@property (nonatomic) NSMutableArray *userNames;
@property (nonatomic) NSMutableArray *userLocations;
@property (nonatomic) NSMutableArray *userLikes;
@property (strong, nonatomic) IBOutletCollection(UIView) NSArray *userViews;

@end

@implementation ParametersViewController

- (NSMutableArray *)userNames
{
    if (!_userNames) _userNames = [[NSMutableArray alloc] initWithCapacity:4];
    return _userNames;
}

- (NSMutableArray *)userLocations
{
    if (!_userLocations) _userLocations = [[NSMutableArray alloc] initWithCapacity:4];
    return _userLocations;
}

- (NSMutableArray *)userLikes
{
    if (!_userLikes) _userLikes = [[NSMutableArray alloc] initWithCapacity:4];
    return _userLikes;
}

- (void)addUserData:(FBGraphObject *)user
{
    [self.userNames addObject:[user valueForKey:@"first_name"]];
    //if ([user valueForKey:@"location"]) [self.userLocations addObject:[user valueForKey:@"location"]];
    //movies, music, books, tv, games, sports, favorite_athletes, favorite_teams, inspirational_people, likes_count
    //[self.userLikes addObject:[user valueForKey:@"interests"]];
    
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
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)showResults:(UIButton *)sender {
}

@end
