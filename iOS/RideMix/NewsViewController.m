//
//  NewsViewController.m
//  RideMix
//
//  Created by Alejandro Rodriguez on 4/21/13.
//  Copyright (c) 2013 Alejandro Rodriguez. All rights reserved.
//

#import "NewsViewController.h"
#import <FacebookSDK/FacebookSDK.h>
#import "AppDelegate.h"
#import "FacebookFriendCell.h"
#import "TopicCollectionViewCell.h"

@interface NewsViewController () <FBFriendPickerDelegate, UITableViewDataSource, UITableViewDelegate, UICollectionViewDataSource, UICollectionViewDelegate>

@property (weak, nonatomic) IBOutlet UITableView *friendsTableView;
@property (retain, nonatomic) FBFriendPickerViewController *friendPickerController;

@property (strong, nonatomic) NSMutableArray *friends;
@property (strong, nonatomic) NSMutableArray *friendsTopics;

@property (strong, nonatomic) NSArray *topics;

@property (nonatomic) NSDictionary *currentUser;
@property (strong, nonatomic) NSMutableArray *userTopics;

@property (weak, nonatomic) IBOutlet UICollectionView *topicsCollectionView;

@end

@implementation NewsViewController

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
    self.friends = [[NSMutableArray alloc] init];
}

- (void)fetchTopics
{
    AppDelegate *appDelegate = [[UIApplication sharedApplication]delegate];
    if ([self.userTopics count] == 0) {
        NSString *userQuery = @"SELECT activities, hometown_location, music, books, tv, games, sports, favorite_athletes, favorite_teams, inspirational_people FROM user WHERE uid = me()";
        // Set up the query parameters
        NSDictionary *queryParam = [NSDictionary dictionaryWithObjectsAndKeys:userQuery, @"q", [appDelegate.session accessTokenData].accessToken, @"access_token", nil];
        // Make the API request that uses FQL
        [FBRequestConnection startWithGraphPath:@"/fql" parameters:queryParam HTTPMethod:@"GET" completionHandler:^(FBRequestConnection *connection, id result, NSError *error) {
            if (error) {
                NSLog(@"Error: %@", [error localizedDescription]);
            } else {
                self.currentUser = [result objectForKey:@"data"][0];
                self.userTopics = [[NSMutableArray alloc] init];
                [self.userTopics addObjectsFromArray:[[self.currentUser objectForKey:@"books"] componentsSeparatedByString:@", "]];
                for (FBGraphObject *athlete in [self.currentUser objectForKey:@"favorite_athletes"]) {
                    [self.userTopics addObject:[athlete objectForKey:@"name"]];
                }
                for (FBGraphObject *team in [self.currentUser objectForKey:@"favorite_teams"]) {
                    [self.userTopics addObject:[team objectForKey:@"name"]];
                }
                [self.userTopics addObjectsFromArray:[[self.currentUser objectForKey:@"music"] componentsSeparatedByString:@", "]];
                [self.userTopics addObjectsFromArray:[[self.currentUser objectForKey:@"tv"] componentsSeparatedByString:@", "]];
                for (FBGraphObject *sport in [self.currentUser objectForKey:@"sports"]) {
                    [self.userTopics addObject:[sport objectForKey:@"name"]];
                }
                [self.userTopics addObjectsFromArray:[[self.currentUser objectForKey:@"games"] componentsSeparatedByString:@", "]];
                for (FBGraphObject *person in [self.currentUser objectForKey:@"inspirational_people"]) {
                    [self.userTopics addObject:[person objectForKey:@"name"]];
                }
            }
        }];
    }
    
    if ([self.friends count] > 0) {
        NSMutableArray *friendIDs = [[NSMutableArray alloc] init];
        for (NSDictionary *friend in self.friends) {
            [friendIDs addObject:[friend objectForKey:@"id"]];
        }
        NSString *friendsQuery = [NSString stringWithFormat:@"SELECT activities, hometown_location, music, books, tv, games, sports, favorite_athletes, favorite_teams, inspirational_people FROM user WHERE uid IN (%@)", [friendIDs componentsJoinedByString:@", "]];
        NSDictionary *friendsQueryParam = [NSDictionary dictionaryWithObjectsAndKeys:friendsQuery, @"q", [appDelegate.session accessTokenData].accessToken, @"access_token", nil];
        [FBRequestConnection startWithGraphPath:@"/fql" parameters:friendsQueryParam HTTPMethod:@"GET" completionHandler:^(FBRequestConnection *connection, id result, NSError *error) {
            if (error) {
                NSLog(@"Error: %@", [error localizedDescription]);
            } else {
                self.friendsTopics = [[NSMutableArray alloc] init];
                NSArray *friendLikes = [result objectForKey:@"data"];
                for (FBGraphObject *friend in friendLikes) {
                    [self.friendsTopics addObjectsFromArray:[[friend objectForKey:@"books"] componentsSeparatedByString:@", "]];
                    for (FBGraphObject *athlete in [friend objectForKey:@"favorite_athletes"]) {
                        [self.friendsTopics addObject:[athlete objectForKey:@"name"]];
                    }
                    for (FBGraphObject *team in [friend objectForKey:@"favorite_teams"]) {
                        [self.friendsTopics addObject:[team objectForKey:@"name"]];
                    }
                    [self.friendsTopics addObjectsFromArray:[[friend objectForKey:@"music"] componentsSeparatedByString:@", "]];
                    [self.friendsTopics addObjectsFromArray:[[friend objectForKey:@"tv"] componentsSeparatedByString:@", "]];
                    for (FBGraphObject *sport in [friend objectForKey:@"sports"]) {
                        [self.friendsTopics addObject:[sport objectForKey:@"name"]];
                    }
                    [self.friendsTopics addObjectsFromArray:[[friend objectForKey:@"games"] componentsSeparatedByString:@", "]];
                    for (FBGraphObject *person in [friend objectForKey:@"inspirational_people"]) {
                        [self.friendsTopics addObject:[person objectForKey:@"name"]];
                    }

                }
            }
        }];
    }
}

- (IBAction)mixTopics:(id)sender {
    [self.userTopics removeObject:@""];
    [self.friendsTopics removeObject:@""];
    NSMutableDictionary *topics = [[NSMutableDictionary alloc] init];
    for (NSString *topic in self.userTopics) [topics setObject:[NSNumber numberWithInt:1] forKey:topic];
    for (NSString *friendTopic in self.friendsTopics) {
        if ([topics objectForKey:friendTopic]) {
            int likes = [[topics objectForKey:friendTopic] integerValue];
            likes++;
            [topics setObject:[NSNumber numberWithInt:likes] forKey:friendTopic];
        } else [topics setObject:[NSNumber numberWithInt:1] forKey:friendTopic];
    }
    
    self.topics = [topics keysSortedByValueUsingSelector:@selector(compare:)];
    if ([self.topics count] > 10) self.topics = [self.topics subarrayWithRange:NSRangeFromString(@"0,10")];
    [self.topicsCollectionView reloadData];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
    [self fetchTopics];
}

- (IBAction)showFriendsPicker:(UIButton *)sender {
    if (self.friendPickerController == nil) {
        // Create friend picker, and get data loaded into it.
        self.friendPickerController = [[FBFriendPickerViewController alloc] init];
        self.friendPickerController.title = @"Pick Friends";
        self.friendPickerController.delegate = self;
        AppDelegate *delegate = [[UIApplication sharedApplication] delegate];
        self.friendPickerController.session = delegate.session;
    }
    
    [self.friendPickerController loadData];
    
    // iOS 5.0+ apps should use [UIViewController presentViewController:animated:completion:]
    // rather than this deprecated method, but we want our samples to run on iOS 4.x as well.
    //[self presentModalViewController:self.friendPickerController animated:YES];
    [self presentViewController:self.friendPickerController animated:YES completion:nil];
}

# pragma mark - UITableViewDataSource

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return [self.friends count];
}

- (NSString *)titleForRow:(NSUInteger)row
{
    return ((id<FBGraphUser>)self.friends[row]).name;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"Friend";
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier forIndexPath:indexPath];
    
    // Configure the cell...
    id<FBGraphUser> user = self.friends[indexPath.row];
    ((FacebookFriendCell *)cell).nameLabel.text = [self titleForRow:indexPath.row];
    ((FacebookFriendCell *)cell).profilePictureView = [[FBProfilePictureView alloc] initWithProfileID:user.id pictureCropping:FBProfilePictureCroppingSquare];
    
    return cell;
}

# pragma mark - FBFriendPickerDelegate

- (void)facebookViewControllerDoneWasPressed:(id)sender {
    // we pick up the users from the selection, and create a string that we use to update the text view
    // at the bottom of the display; note that self.selection is a property inherited from our base class
    self.friends = [[NSMutableArray alloc] init];
    for (id<FBGraphUser> user in self.friendPickerController.selection) {
        [self.friends addObject:user];
    }
    [self dismissViewControllerAnimated:YES completion:nil];
    [self.friendsTableView reloadData];
}

- (void)facebookViewControllerCancelWasPressed:(id)sender {
    // do stuff if they press cancel
    [self dismissViewControllerAnimated:YES completion:nil];
}

# pragma mark - UICollectionViewDataSource

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath
{
    UICollectionViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:@"Topic" forIndexPath:indexPath];
    
    // Configure the cell...
    ((TopicCollectionViewCell *)cell).topicView.name = self.topics[indexPath.row];
    NSString *url = @"https://blekko.com/ws/?q=";
    NSString *topicEncoding = [self.topics[indexPath.row] stringByReplacingOccurrencesOfString:@" " withString:@"+"];
    NSString *urlWithTopic = [url stringByAppendingString:topicEncoding];
    NSString *urlWithSlashtag = [urlWithTopic  stringByAppendingString:@"+%2Fnews"];
    ((TopicCollectionViewCell *)cell).topicView.url = [NSURL URLWithString:urlWithSlashtag];
    [((TopicCollectionViewCell *)cell).topicView.button setFrame:CGRectMake(0, 0, 242, 48)];
    [((TopicCollectionViewCell *)cell).topicView.detailButton setFrame:CGRectMake(0, 0, 23, 23)];
    [((TopicCollectionViewCell *)cell).topicView.button setTitle:self.topics[indexPath.row] forState:UIControlStateNormal];
    [((TopicCollectionViewCell *)cell).topicView.button setTitle:self.topics[indexPath.row] forState:UIControlStateSelected];
    
    return cell;
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section
{
    return [self.topics count];
}

- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath {
    return CGSizeMake(274, 50);
}

@end
