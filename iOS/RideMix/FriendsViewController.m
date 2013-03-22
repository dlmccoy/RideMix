//
//  FriendsViewController.m
//  RideMix
//
//  Created by Alejandro Rodriguez on 3/22/13.
//  Copyright (c) 2013 Alejandro Rodriguez. All rights reserved.
//

#import "FriendsViewController.h"
#import <FacebookSDK/FacebookSDK.h>
#import "AppDelegate.h"
#import "FacebookFriendCell.h"

@interface FriendsViewController () <FBFriendPickerDelegate, UITableViewDataSource, UITableViewDelegate>

@property (weak, nonatomic) IBOutlet UITableView *tableView;
@property (retain, nonatomic) FBFriendPickerViewController *friendPickerController;
@property (strong, nonatomic) NSMutableArray *selectedFriends;

@end

@implementation FriendsViewController

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
    self.selectedFriends = [[NSMutableArray alloc] init];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
    self.friendPickerController = nil;
}

# pragma mark - UITableViewDataSource

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return [self.selectedFriends count];
}

- (NSString *)titleForRow:(NSUInteger)row
{
    return ((id<FBGraphUser>)self.selectedFriends[row]).name;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"Friend";
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier forIndexPath:indexPath];
    
    // Configure the cell...
    id<FBGraphUser> user = self.selectedFriends[indexPath.row];
    ((FacebookFriendCell *)cell).nameLabel.text = [self titleForRow:indexPath.row];
    ((FacebookFriendCell *)cell).profilePictureView = [[FBProfilePictureView alloc] initWithProfileID:user.id pictureCropping:FBProfilePictureCroppingSquare];
    
    return cell;
}

# pragma mark - FBFriendPickerDelegate

- (void)facebookViewControllerDoneWasPressed:(id)sender {    
    // we pick up the users from the selection, and create a string that we use to update the text view
    // at the bottom of the display; note that self.selection is a property inherited from our base class
    self.selectedFriends = [[NSMutableArray alloc] init];
    for (id<FBGraphUser> user in self.friendPickerController.selection) {
        [self.selectedFriends addObject:user];
    }
    [self dismissViewControllerAnimated:YES completion:nil];
    [self.tableView reloadData];
}

- (void)facebookViewControllerCancelWasPressed:(id)sender {
    // do stuff if they press cancel
    [self dismissViewControllerAnimated:YES completion:nil];
}

@end
